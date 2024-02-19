import axios from 'axios';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';


const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 9000;

app.get('/', (req, res) => {
    res.send('Welcome to my Node.js server!');
});



io.on('connection', async (socket) => {
    const currentUserId = socket.handshake.auth.token;
    console.log('a user connected to this: ' + currentUserId);

    const editUserUrl = 'https://pakmachinery.com.pk/api/edit-profile/' + currentUserId;

    try {
        await axios.post(editUserUrl, {
            isOnline: true,
        });
        io.emit('userOnline', { user_id: currentUserId });
    } catch (error) {
        console.error('API request on connection failed:', error);
    }

    socket.on('chatMessage', msg => {
        io.emit('chatMessage', msg);
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected: ' + currentUserId);
        try {
            await axios.post(editUserUrl, {
                isOnline: false,
            });
            io.emit('userOffline', { user_id: currentUserId });
        } catch (error) {
            console.error('API request on connection failed:', error);
        }

    });
});

server.listen(port, () => {
    console.log('server running on port:' + port);
});
