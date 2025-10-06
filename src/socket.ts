import { Server as SocketIOServer, Socket } from "socket.io";

export const socketSetup = (io: SocketIOServer)=>{
    io.on("connection", (socket: Socket)=>{
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
})
}