import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

io.on('connection', (socket) => {
    console.log('conn');
});

app.use(express.static(path.join(__dirname, '/../../simulation/dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '/../../simulation/dist/index.html'));
});

app.post('/postdata', (req, res) => {
    io.emit('update', req.body.data);
    res.status(200).end();
});

httpServer.listen(1000);
