let express = require('express');
let router = express.Router();
let path = require('path');
let _ = require('lodash');

var fs = require('fs');
var {Sequelize} = require('sequelize');

var sequelize = new Sequelize('danielye', 'user', 'password1234', {
  dialect: 'postgres',
  username: 'user',
  port: 26257,
  host: 'trusty-lemur-8c3.gcp-northamerica-northeast1.cockroachlabs.cloud',
  dialectOptions: {
    ssl: {
        ca: fs.readFileSync('C:/Work/hack_the_north/trusty-lemur-ca.crt')
            .toString(),
    }
},
  logging: false
});

var Session = sequelize.define('sessions', {
  sessionid: { type: Sequelize.STRING},
  roomname: { type: Sequelize.STRING }
});

const apiKey = process.env.TOKBOX_API_KEY;
const secret = process.env.TOKBOX_SECRET;


if (!apiKey || !secret) {
  console.error('=========================================================================================================');
  console.error('');
  console.error('Missing TOKBOX_API_KEY or TOKBOX_SECRET');
  console.error('Find the appropriate values for these by logging into your TokBox Dashboard at: https://tokbox.com/account/#/');
  console.error('Then add them to ', path.resolve('.env'), 'or as environment variables' );
  console.error('');
  console.error('=========================================================================================================');
  process.exit();
}

const OpenTok = require('opentok');
const opentok = new OpenTok(apiKey, secret);

// IMPORTANT: roomToSessionIdDictionary is a variable that associates room names with unique
// unique session IDs. However, since this is stored in memory, restarting your server will
// reset these values if you want to have a room-to-session association in your production
// application you should consider a more persistent storage

var roomToSessionIdDictionary = {};

// returns the room name, given a session ID that was associated with it
function findRoomFromSessionId(sessionId) {
  return _.findKey(roomToSessionIdDictionary, function (value) { return value === sessionId; });
}

  // _-_-_-_- Entry Point -_-_-_-_-_
router.get('/', function (req, res) {

  console.log(__dirname);
  res.sendFile(path.join(__dirname, '../../client/html', 'index.html'))
});

/**
 * GET /session redirects to /room/session
 */
router.get('/session', function (req, res) {
  res.redirect('/room/session');
});

Session.sync({});

/**
 * GET /room/:name
 */
router.get('/room/:name', function (req, res) {
  var roomName = req.params.name;
  var sessionId;
  var token;
  console.log('attempting to create a session associated with the room: ' + roomName);

  Session.sync({}).then(function() {
    return Session.findOne({
      where: {roomname: roomName}
   })}).then(function(session) {
      if (!session) {
        console.log("no room found");

        opentok.createSession({ mediaMode: 'routed' }, function (err, session) {
          if (err) {
            console.log(err);
            res.status(500).send({ error: 'createSession error:' + err });
            return;
          } 
            token = opentok.generateToken(session.sessionId);
            Session.bulkCreate([
                  {sessionid: session.sessionId, roomname: roomName},
                ])
            res.setHeader('Content-Type', 'application/json');
            res.send({
              apiKey: '47082344',
              sessionId: session.sessionId,
              token: token
            });
        });

      } else {
        console.log("room found and the session id is " + session.sessionid);

        token = opentok.generateToken(session.sessionid);
        res.setHeader('Content-Type', 'application/json');
        res.send({
          apiKey: '47082344',
          sessionId: sessionId,
          token: token
        });
      }

    }).catch(function(err) {
      console.error('error: ' + err.message);
    });

  // // if the room name is associated with a session ID, fetch that
  // if (roomToSessionIdDictionary[roomName]) {
  //   sessionId = roomToSessionIdDictionary[roomName];

  //   var tokenOptions = {};
  //   tokenOptions.role = "subscriber";
  //   console.log("subscriber");
  //   // generate token
  //   token = opentok.generateToken(sessionId, tokenOptions);
  //   res.setHeader('Content-Type', 'application/json');
  //   res.send({
  //     apiKey: apiKey,
  //     sessionId: sessionId,
  //     token: token
  //   });
  // }
  // // if this is the first time the room is being accessed, create a new session ID
  // else {
  //   opentok.createSession({ mediaMode: 'routed' }, function (err, session) {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).send({ error: 'createSession error:' + err });
  //       return;
  //     }

  //     // now that the room name has a session associated wit it, store it in memory
  //     // IMPORTANT: Because this is stored in memory, restarting your server will reset these values
  //     // if you want to store a room-to-session association in your production application
  //     // you should use a more persistent storage for them
  //     roomToSessionIdDictionary[roomName] = session.sessionId;

  //     var tokenOptions = {};
  //     tokenOptions.role = "publisher";
  
  //     console.log("publisher");

  //     // generate token
  //     token = opentok.generateToken(session.sessionId, tokenOptions);
  //     res.setHeader('Content-Type', 'application/json');
  //     res.send({
  //       apiKey: apiKey,
  //       sessionId: session.sessionId,
  //       token: token
  //     });
  //   });
  // }
});









module.exports = router;