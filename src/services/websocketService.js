class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.connected = false;
    // this.url = 'ws://185.170.196.16:8001/ws/admin/meal_updates/';
    this.url = 'wss://event.neurocode.in/ws/admin/meal_updates/';
    this.currentRoom = null;
    this.roomMembers = new Set();
    this.connectionQueue = [];
    this.roomJoinConfirmed = false;
  }

  connectWithAuth(eventId) {
    eventId = Number(eventId);
    
    const token = localStorage.getItem('accessToken');

    console.log('🔄 WebSocketService: Connecting with auth', {
      eventId,
      hasToken: !!token,
      currentState: this.ws?.readyState,
    });

    if (!token || !eventId) {
      console.error('❌ WebSocketService: Missing token or event ID');
      return;
    }

    try {
      const wsUrl = `${this.url}?token=${token}&event_id=${eventId}`;
      console.log('🔌 WebSocketService: Connecting to:', wsUrl);

      if (this.ws) {
        console.log('🔄 Closing existing connection');
        this.ws.close();
      }

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocketService: Connection established for event:', eventId);
        this.connected = true;
        
        // Wait a short moment before joining the room
        setTimeout(() => {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.joinRoom(eventId);
          }
        }, 500);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('��� WebSocket message received:', data);

          if (data.type === 'ROOM_JOIN_SUCCESS') {
            console.log('✅ Room join confirmed:', data);
            this.roomJoinConfirmed = true;
            this.currentRoom = eventId;
          }

          this.subscribers.forEach(callback => callback(data));
        } catch (error) {
          console.error('❌ Error processing message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('❌ WebSocketService: Connection closed:', event.code, event.reason);
        this.connected = false;
        this.currentRoom = null;
        this.roomJoinConfirmed = false;
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocketService: WebSocket error:', error);
      };

    } catch (error) {
      console.error('❌ WebSocketService: Setup error:', error);
    }
  }

  joinRoom(eventId) {
    eventId = Number(eventId);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error(
        '❌ WebSocketService: Cannot join room - WebSocket not connected'
      );
      return;
    }

    console.log('🔄 WebSocketService: Attempting to join room:', {
      currentRoom: this.currentRoom,
      joiningRoom: eventId,
      connectionState: this.ws.readyState,
      clientType: this.getClientType(),
      readyState: this.ws.readyState,
    });

    const joinMessage = {
      type: 'JOIN_ROOM',
      event_id: eventId,
      client_type: this.getClientType(),
      timestamp: new Date().toISOString(),
    };

    try {
      this.ws.send(JSON.stringify(joinMessage));
      console.log('📤 Room join request sent:', joinMessage);
    } catch (error) {
      console.error('❌ Error sending room join request:', error);
    }
  }

  getClientType() {
    return window.location.pathname.includes('/admin') ? 'admin' : 'employee';
  }

  handleRoomJoinResponse(data) {
    if (data.type === 'ROOM_JOIN_SUCCESS') {
      this.roomJoinConfirmed = true;
      this.currentRoom = Number(data.event_id);
      this.roomMembers = new Set(data.members || []);

      console.log('✅ Room join confirmed:', {
        room: this.currentRoom,
        clientType: this.getClientType(),
        members: Array.from(this.roomMembers),
        timestamp: new Date().toISOString(),
      });

      this.subscribers.forEach((callback) => {
        callback({
          type: 'ROOM_JOIN_STATUS',
          success: true,
          event_id: Number(data.event_id),
          members: Array.from(this.roomMembers),
        });
      });
    } else if (data.type === 'ROOM_JOIN_ERROR') {
      console.error('❌ Room join failed:', data.message);
      this.roomJoinConfirmed = false;
      this.currentRoom = null;
    }
  }

  isInRoom(eventId) {
    return this.connected && 
           this.currentRoom === Number(eventId) && 
           this.roomJoinConfirmed;
  }

  subscribe(callback) {
    console.log(' WebSocketService: Adding subscriber');
    this.subscribers.add(callback);
    return () => {
      console.log(' WebSocketService: Removing subscriber');
      this.subscribers.delete(callback);
    };
  }

  sendMessage(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocketService: WebSocket not ready');
      return;
    }

    try {
      const messageWithEventId = {
        ...message,
        event_id: Number(this.currentRoom),
      };

      console.log('🚀 WebSocketService: Sending message with event_id:', {
        message: messageWithEventId,
        currentRoom: this.currentRoom,
        readyState: this.ws.readyState,
      });

      this.ws.send(JSON.stringify(messageWithEventId));
      console.log('✅ WebSocketService: Message sent successfully');
    } catch (error) {
      console.error('❌ WebSocketService: Send error:', error);
    }
  }

  onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      console.log('📥 WebSocketService received message:', {
        type: data.type,
        room: this.currentRoom,
        data: data,
      });

      // Handle different message types
      switch (data.type) {
        case 'ROOM_JOIN_SUCCESS':
        case 'ROOM_JOIN_ERROR':
        case 'MEMBER_JOINED':
        case 'MEMBER_LEFT':
          this.handleRoomJoinResponse(data);
          break;

        case 'MEAL_SCANNED':
          console.log('📊 Meal scan update received:', {
            mealType: data.meal_type,
            newCount: data.new_count,
            eventId: data.event_id,
            currentRoom: this.currentRoom,
            joinConfirmed: this.roomJoinConfirmed,
          });
          break;

        default:
          console.log('ℹ️ Other message received:', data.type);
      }

      // Notify subscribers
      this.subscribers.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error('❌ Error in subscriber callback:', err);
        }
      });
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  };

  // Add method to check room join status
  isRoomJoinConfirmed() {
    return this.roomJoinConfirmed;
  }
}

export const websocketService = new WebSocketService();
