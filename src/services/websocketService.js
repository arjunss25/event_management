class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect() {
    if (this.isConnected) return;

    // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // const host = window.location.host;
    const WEBSOCKET_URL = `ws://185.170.196.16:8001/ws/admin/meal_updates/`;

    try {
      console.log('Attempting WebSocket connection to:', WEBSOCKET_URL);
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          if (
            data.type === 'meal_scanned' &&
            data.meal_type &&
            typeof data.new_count === 'number'
          ) {
            this.notifySubscribers(data);
          } else {
            console.warn(
              'Received WebSocket message in unexpected format:',
              data
            );
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        console.log(
          `WebSocket Closed - Code: ${event.code}, Reason: ${event.reason}`
        );

        switch (event.code) {
          case 1000:
            console.log('Normal closure');
            break;
          case 1006:
            console.log(
              'Abnormal closure - Server might be down or unreachable'
            );
            break;
          case 1015:
            console.log('TLS handshake failure');
            break;
          default:
            console.log(`Unknown close code: ${event.code}`);
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(
            `Reconnecting... Attempt ${this.reconnectAttempts + 1} of ${
              this.maxReconnectAttempts
            }`
          );
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.reconnectDelay);
        } else {
          console.error(
            'Max reconnection attempts reached. Please refresh the page.'
          );
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        console.log('Connection Details:', {
          url: WEBSOCKET_URL,
          readyState: this.ws?.readyState,
          protocol: window.location.protocol,
          host: window.location.host,
          origin: window.location.origin,
        });
      };
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(data) {
    console.log('Broadcasting to subscribers:', data);
    this.subscribers.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  sendMessage(data) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}

export const websocketService = new WebSocketService();
