// class WebSocketService {
//   constructor() {
//     this.ws = null;
//     this.subscribers = new Set();
//   }

//   connect() {
   
//     const WEBSOCKET_URL = 'wss://event.neurocode.in/ws/admin/meal_updates/';

//     this.ws = new WebSocket(WEBSOCKET_URL);

//     this.ws.onopen = () => {
//       console.log('WebSocket Connected');
//     };

//     this.ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('WebSocket message received:', data);
//         this.notifySubscribers(data);
//       } catch (error) {
//         console.error('WebSocket message parsing error:', error);
//       }
//     };

//     this.ws.onclose = () => {
//       console.log('WebSocket Disconnected - Reconnecting...');
//       setTimeout(() => this.connect(), 3000);
//     };

//     this.ws.onerror = (error) => {
//       console.error('WebSocket Error:', error);
//     };
//   }

//   subscribe(callback) {
//     this.subscribers.add(callback);
//     return () => this.subscribers.delete(callback);
//   }

//   notifySubscribers(data) {
//     this.subscribers.forEach(callback => callback(data));
//   }
// }

// export const websocketService = new WebSocketService(); 