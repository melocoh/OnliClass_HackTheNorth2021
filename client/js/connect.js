const socket = io();

const joinRandom = () => {

    data = {
        username: 'temp',
        room_num: 'temp2',
    }

    console.log("joining room");
    socket.emit('join_random_room', data);
}

const leaveRoom = () => {

    data = {
        username: 'temp',
        room_num: 'temp2',
    }
    console.log("leaving room");
    socket.emit('leave_room', data);
}

const joinRoom = (room_num, nickname) => {
    if (room_num) {

        data = {
            username: nickname,
            room_num: room_num,
        }
        socket.emit("join_room", data);
    }

}

const createRoom = () => {

    let room_num = document.getElementById('create_room_num').value;
    if (room_num) {
        data = {
            username: 'temp',
            room_num: room_num,
        }
        socket.emit("create_room", data);
    }
}

const createRandomRoom = () => {

    data = {
        username: "temp"
    }
    socket.emit("create_random_room", data);
}

socket.on('join_room_fail', (data) => {
    console.log(data);
});

socket.on('join_room_success', (data) => {
    console.log(data);
    let room_num_header = document.getElementById('room_num_header');
    room_num_header.innerHTML = data.room_num;
});

socket.on('create_room_fail', (data) => {
    console.log(data);
});

socket.on('create_room_success', (data) => {
    console.log(data);
    let room_num_header = document.getElementById('room_num_header');
    room_num_header.innerHTML = data;
});

socket.on('leave_room_success', (data) => {
    let room_num_header = document.getElementById('room_num_header');
    room_num_header.innerHTML = "No room joined";
});