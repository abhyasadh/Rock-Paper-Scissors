let socket = null;
const pendingMessages = [];
let isConnected = false;

const connectToServer = (url, onMessage, onError, onClose) => {
  if (socket) return;

  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('Connected to WebSocket server');
    isConnected = true;

    while (pendingMessages.length > 0) {
      const message = pendingMessages.shift();
      socket.send(message);
    }
  };

  socket.onmessage = (event) => {
    if (onMessage) onMessage(event);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) onError(error);
  };

  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
    isConnected = false;
    if (onClose) onClose();
    socket = null;
  };
};

const sendMessage = (message) => {
  const messageString = JSON.stringify(message);
  if (isConnected && socket) {
    socket.send(messageString);
  } else {
    console.log('Queuing message:', message);
    pendingMessages.push(messageString);
  }
};

const disconnect = () => {
  if (socket) {
    socket.close();
    socket = null;
    isConnected = false;
  }
};

export { socket, isConnected, connectToServer, sendMessage, disconnect };