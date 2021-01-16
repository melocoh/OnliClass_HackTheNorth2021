$(document).ready(function() {

    console.log("Initializing chat variables");

    const FADE_TIME = 150; // ms
    const TYPING_TIMER_LENGTH = 400; // ms
    const COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
  
    const typeCounter = 0;
    const typeText = "our name i'm guessing";
    const typeSpeed = 75;
    
      // Initialize variables
    const $window = $(window);
    const $usernameInput = $('.usernameInput'); // Input for username
    const $messages = $('#chatRoom'); // Messages area
    const $inputMessage = $('#messageBar'); // Input message input box
    const $loginPage = $('.login.page'); // The login page
    const $chatPage = $('.chat.page'); // The chatroom page
    const $containerWrapper = $('#container-wrapper'); // The main section wrapper
    const $sendButton = $("#sendButton");

    // Prompt for setting a username
    var username = socket;
    var connected = true;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();
    
    // Sends a chat message
    function sendMessage(){
      console.log("trying to send message");
      let message = $inputMessage.val();
      // Prevent markup from being injected into the message
      message = cleanInput(message);
      // if there is a non-empty message and a socket connection
      if (message && connected) {
        console.log("here im also in here?");
        $inputMessage.val('');
        addChatMessage({
          username: username,
          message: message
        });
        // tell server to execute 'new message' and send along one parameter

        let payload = {
          username: username,
          message: message
        }
        socket.emit('new message', payload);
      }
    }
  
    // Log a message
    const log = (message, options) => {
      var $el = $('<li>').addClass('log').text(message);
      addMessageElement($el, options);
    }
  
    // Adds the visual chat message to the message list
    const addChatMessage = (data, options) => {
      // Don't fade the message in if there is an 'X was typing'
      var $typingMessages = getTypingMessages(data);
      options = options || {};
      if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
      }
  
      var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', getUsernameColor(data.username));
      var $messageBodyDiv = $('<span class="messageBody">')
        .text(data.message);
  
      var typingClass = data.typing ? 'typing' : '';
      var $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .addClass(typingClass)
        .append($usernameDiv, $messageBodyDiv);
  
      addMessageElement($messageDiv, options);
    }
  
    // Adds the visual chat typing message
    const addChatTyping = (data) => {
      data.typing = true;
      data.message = 'is typing';
      addChatMessage(data);
    }
  
    // Removes the visual chat typing message
    const removeChatTyping = (data) => {
      getTypingMessages(data).fadeOut(function () {
        $(this).remove();
      });
    }
  
    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    const addMessageElement = (el, options) => {
      var $el = $(el);
  
      // Setup default options
      if (!options) {
        options = {};
      }
      if (typeof options.fade === 'undefined') {
        options.fade = true;
      }
      if (typeof options.prepend === 'undefined') {
        options.prepend = false;
      }
  
      // Apply options
      if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
      }
      if (options.prepend) {
        $messages.prepend($el);
      } else {
        $messages.append($el);
      }
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }
  
    // Prevents input from having injected markup
    const cleanInput = (input) => {
      return $('<div/>').text(input).html();
    }
  
    // Updates the typing event
    const updateTyping = () => {
      if (connected) {
        if (!typing) {
          typing = true;
          socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();
  
        setTimeout(() => {
          var typingTimer = (new Date()).getTime();
          var timeDiff = typingTimer - lastTypingTime;
          if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing');
            typing = false;
          }
        }, TYPING_TIMER_LENGTH);
      }
    }
  
    // Gets the 'X is typing' messages of a user
    const getTypingMessages = (data) => {
      return $('.typing.message').filter(function (i) {
        return $(this).data('username') === data.username;
      });
    }
  
    // Gets the color of a username through our hash function
    const getUsernameColor = (username) => {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }
  
    // Keyboard events
  
    $window.keydown(event => {

      console.log("hello in here");
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        if (username) {
          console.log("in here");
          sendMessage();
          socket.emit('stop typing');
          typing = false;
        } else {
          setUsername();
        }
      }
    });
  
    $inputMessage.on('input', () => {
      updateTyping();
    });
  
    // Click events
  
    // Focus input when clicking anywhere on login page
    $loginPage.click(() => {
      $currentInput.focus();
    });
  
    // Focus input when clicking on the message input's border
    $inputMessage.click(() => {
      $inputMessage.focus();
    });
  

    $sendButton.click(() => {
      sendMessage();
    });
    // Socket events
  
    // Whenever the server emits 'entrance', log the login message
    socket.on('entrance', (data) => {
      connected = true;
      username = data.username;
      console.log(data);
      console.log(username);
      // Display the welcome message
      let message = "- Welcome to the Chat – " + data.username;
      log(message, {
        prepend: true
      });
    });
  
    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', (data) => {
      addChatMessage(data);
    });
  
    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', (data) => {
      var newUser = '<p class="user">' + data.username + '</p>';
      log(data.username + ' has joined the room');
      $("#userList").append(newUser);
    });
  
    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', (data) => {
      log(data.username + ' has left the room');
      removeChatTyping(data);
    });
  
    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', (data) => {
      addChatTyping(data);
    });
  
    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', (data) => {
      removeChatTyping(data);
    });
  
  
    const typeWriter = () => {
      if (typeCounter < typeText.length) {
        document.getElementById("header").innerHTML += typeText.charAt(typeCounter);
        typeCounter++;
        setTimeout(typeWriter, typeSpeed);
      }
    }
  
});