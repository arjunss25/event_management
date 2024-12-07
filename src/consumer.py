from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json
from urllib.parse import parse_qs
import traceback

class AdminMealCountConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Get event_id from query parameters
            query_string = parse_qs(self.scope['query_string'].decode())
            print("Raw query string:", self.scope['query_string'].decode())
            print("Parsed query string:", query_string)
            
            self.event_id = query_string.get('event_id', [None])[0]
            print(f"⚡ Connection attempt with event_id: {self.event_id}")

            # Accept the connection
            await self.accept()
            
            print("Connection accepted")
            
            # Send connected confirmation
            await self.send(text_data=json.dumps({
                "type": "CONNECTED",
                "message": "WebSocket connection established",
                "event_id": self.event_id
            }))

            print(f"✅ WebSocket connected for event: {self.event_id}")

        except Exception as e:
            print(f"❌ Error in connect: {str(e)}")
            print("Traceback:", traceback.format_exc())
            await self.close()

    async def receive(self, text_data):
        try:
            print(f"Raw message received: {text_data}")
            data = json.loads(text_data)
            print(f"📩 Parsed message: {data}")

            message_type = data.get('type')
            print(f"Message type: {message_type}")

            if message_type == 'JOIN_ROOM':
                print("Processing JOIN_ROOM request")
                await self.handle_join_room(data)
            elif message_type == 'MEAL_SCANNED':
                print("Processing MEAL_SCANNED request")
                await self.handle_meal_scan(data)
            else:
                print(f"Unknown message type: {message_type}")

        except Exception as e:
            print(f"❌ Error in receive: {str(e)}")
            print("Traceback:", traceback.format_exc())
            await self.send(text_data=json.dumps({
                "type": "ERROR",
                "message": str(e)
            }))

    async def handle_join_room(self, data):
        try:
            event_id = str(data.get('event_id'))
            client_type = data.get('client_type')
            
            print(f"🔄 Processing join room: event={event_id}, client={client_type}")
            
            # Create event-specific group name
            self.event_group_name = f"event_{event_id}"
            
            # Join the event-specific group
            print(f"Adding to group: {self.event_group_name}")
            await self.channel_layer.group_add(
                self.event_group_name,
                self.channel_name
            )

            # Send join confirmation
            response = {
                "type": "ROOM_JOIN_SUCCESS",
                "event_id": event_id,
                "client_type": client_type,
                "message": f"{client_type} joined event {event_id}"
            }
            
            print(f"Sending join confirmation: {response}")
            await self.send(text_data=json.dumps(response))
            print("Join confirmation sent")

        except Exception as e:
            print(f"❌ Error in handle_join_room: {str(e)}")
            print("Traceback:", traceback.format_exc())
            await self.send(text_data=json.dumps({
                "type": "ERROR",
                "message": f"Failed to join room: {str(e)}"
            }))

    async def handle_meal_scan(self, data):
        try:
            if not hasattr(self, 'event_group_name'):
                print("❌ No event group set for this connection")
                return

            print(f"Broadcasting meal scan to group: {self.event_group_name}")
            
            # Broadcast the meal scan to everyone in the event group
            await self.channel_layer.group_send(
                self.event_group_name,
                {
                    "type": "broadcast_meal_scan",
                    "meal_type": data.get("meal_type"),
                    "new_count": data.get("new_count"),
                    "event_id": int(self.event_id),
                    "timestamp": data.get("timestamp")
                }
            )
            print("Broadcast sent")

        except Exception as e:
            print(f"❌ Error in handle_meal_scan: {str(e)}")
            print("Traceback:", traceback.format_exc())

    async def broadcast_meal_scan(self, event):
        try:
            print(f"Broadcasting meal scan: {event}")
            await self.send(text_data=json.dumps({
                "type": "MEAL_SCANNED",
                "meal_type": event["meal_type"],
                "new_count": event["new_count"],
                "event_id": event["event_id"],
                "timestamp": event["timestamp"]
            }))
            print("Broadcast complete")
            
        except Exception as e:
            print(f"❌ Error in broadcast_meal_scan: {str(e)}")
            print("Traceback:", traceback.format_exc())