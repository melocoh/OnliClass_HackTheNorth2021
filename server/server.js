const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');

/* Load environment variables */
dotenv.config();

const server = require('http').createServer(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');



let indexRouter = require('./routes/index');

const hostname = 'http://localhost:' + port;
const allRooms = new Map();
const allClients = [];

io.on('connection', (socket) => {
    let joined_room = null;
    allClients.push(socket);
    console.log("Someone connected!");

    socket.on('drawing', data => {
        console.log("someone is drawing");
        if(!joined_room) return;
        allRooms.get(joined_room).forEach( (sock) =>{
            socket.to(sock.id).emit('drawing',data);
        });
    });

    const socket_name = uniqueNamesGenerator({
        dictionaries: [colors, animals],
        style: 'capital'
      });

    socket.emit('entrance', {username: socket_name,numUsers: 0}); 

    /* Handle room enter event */
    socket.on('join_room', data =>{
        console.log("someone wants to join a room");
        
        if(data.room_num && allRooms.has(data.room_num)){
            console.log("successfully joined room: " + data.room_num);
            joined_room = data.room_num;
            allRooms.get(data.room_num).add(socket);
            socket.emit("join_room_success", data);
        }else{
            console.log(data.room_num);
            socket.emit("join_room_fail", "failed to join room");
            console.log("failed to join room bud");
        }

    });

    socket.on('join_random_room', data =>{

        /* If someone already joined a room */
        if(joined_room != null){
            socket.emit("join_room_fail", "already joined a room");
            return;
        }

        let room_num;

        console.log("someone wants to join a random room");

        if(allRooms.size == 0){
            /* Generate a random room number from 1 to 1000 */
            room_num = Math.floor((Math.random() * 1000) + 1);
            /* Find a key that does not exist within the room map */
            while(allRooms.has(room_num)){
                room_num = Math.floor((Math.random() * 1000) + 1);
            }
            allRooms.set(room_num, socket);

        }else{
            const iterator = allRooms.keys();
            let rand = Math.floor((Math.random() * (allRooms.size-1)) + 0);
            for(let i = 0; i < rand; i++){
                iterator.next();
            }
            room_num = iterator.next();
            console.log("was able to join a random room");
        }

        joined_room = room_num + '';
        socket.to('some room').emit('some event');

    });

    /* Handle room leave event */
    socket.on('leave_room', data =>{
        console.log("someone left a room");
        console.log(data.username);
        joined_room = null;
        socket.emit("leave_room_success", data);
    });

    /* Handle create room event */
    socket.on('create_room', data =>{
        console.log("someone wants to create a room");
        console.log(data.username);


        if(data.room_num && !allRooms.get(data.room_num)){
            let set = new Set();
            set.add(socket);
            allRooms.set(data.room_num, set);
            joined_room = data.room_num + '';
            socket.emit("create_room_success", joined_room);

        }else{
            socket.emit("create_room_fail", "failed to create room");
        }
        console.log(allRooms);
    });

    socket.on('create_random_room', data => {
        console.log("someone wants to create a random room");
        console.log(data.username);
        
        let rand_num = Math.floor((Math.random() * 1000) + 1);
        while(allRooms.has(rand_num)){
            rand_num = Math.floor((Math.random() * 1000) + 1);
            console.log('hi');
        }

        /* Each room has users (sockets) */
        let set = new Set();
        set.add(socket);
        allRooms.set(rand_num + '', set);
        console.log(allRooms.has(rand_num));
        joined_room = rand_num + '';

        console.log("room created successfully");
        socket.emit("create_room_success", joined_room);
        
    })
    /* Handle pause */
    socket.on('pause_video', data =>{
        console.log("someone wants to pause the video");

        if(!joined_room) return;
        allRooms.get(joined_room).forEach( (sock) =>{
            socket.to(sock.id).emit('pause_video',{
                username: data.username,
                timestamp: data.timestamp,
            });
        });
    });

    /* Handle play */
    socket.on('play_video', data =>{
        console.log("someone wants to play the video"); 
        if(!joined_room) return;
        allRooms.get(joined_room).forEach( (sock) =>{
            socket.to(sock.id).emit('play_video',{
                username: data.username,
                timestamp: data.timestamp,
            });
        });

    });

    // Handle disconnected users */
    socket.on('disconnect', () => {
        console.log('Someone disconnected!');
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
     });


    socket.on('stop typing', () => 
    {
        console.log('someone stopped typing');

        if(!joined_room) return;
        allRooms.get(joined_room).forEach( (sock) =>{
            socket.to(sock.id).emit('stop typing');
        });
    });

    socket.on('new message', (data) => 
    {
        console.log("someone sent a message");
        if(!joined_room) return;
        allRooms.get(joined_room).forEach( (sock) =>{
            socket.to(sock.id).emit('new message',{
                username: data.username,
                message: data.message,
            });
        });
    });
});

app.use(express.static(path.join(__dirname, "../client")));

app.use('/', indexRouter);

/* Listen on port */
server.listen(port, () => {
    console.log("Server listening at port %d", port);
});

