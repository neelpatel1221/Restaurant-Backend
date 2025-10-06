import { app } from "./app";
import { createServer } from "http"
import { connectDB } from "./utils/connectDB";
import { Server as SocketIOServer } from 'socket.io';
import { socketSetup } from "./socket";

const server = createServer(app);


const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});



(async () => {
  try {
    await connectDB();
    socketSetup(io);

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
