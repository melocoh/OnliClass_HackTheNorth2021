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

    let is_host = false;

    if(data.role === 'host') is_host = true;

    let getInfo = async () => {
        const response = await fetch('/room/' + data.room_num);
        const json_response = await response.json(); //extract JSON from the http response
        console.log(json_response);
        socket.emit("opentok host success", json_response);
        initializeSession(json_response.apiKey, json_response.sessionId, json_response.token, is_host);
    }

    getInfo().then(_ => console.log("Successfully initialized host video"), err => console.log("failed to initialize video" + err));

});

socket.on('create_room_fail', (data) => {
    console.log(data);
});

socket.on('create_room_success', (data) => {
    console.log(data);
});




/* Vonage API scripts */

function initializeSession(apiKey, sessionId, token, topublish) {
    console.log(topublish);
    var session = OT.initSession(apiKey, sessionId);
    if(!topublish){
        session.on("streamCreated", (event) =>  {
            console.log(event.stream);
            session.subscribe(event.stream, 'publisher');
        });
    }
    if(topublish){
    console.log("publishing");
    var publisher = OT.initPublisher('publisher', {
        insertMode: 'append',
        width: '100%',
        height: '100%'
    }, handleError);

    publisher.on({
        streamCreated: function (event) {
          console.log("Publisher started streaming.");
        },
        streamDestroyed: function (event) {
          console.log("Publisher stopped streaming. Reason: "
            + event.reason);
        }
    });
}


// Connect to the session
session.connect(token, function (error) {
    if (error) {
    handleError(error);
    } else {
    session.publish(publisher, handleError);
    }
});
}


// Handling all of our errors here by alerting them
function handleError(error) {
if (error) {
    alert(error.message);
}
}
