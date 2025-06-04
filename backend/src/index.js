import { server } from './app.js';
  
const port = 3000;
const host = '0.0.0.0';

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
  console.log(`WebSocket server ready for real-time polling`);
});