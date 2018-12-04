$(function () {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('#username-input'); // Input for username
    var $passwordInput = $('#password-input'); //Input for password
    var $enterPasswordText = $('#password-container')
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('#message-input'); // Input message input box
    var $loginButton = $('#login-button-confirm');

    var $loginPage = $('#login-container'); // The login page
    var $chatPage = $('#chat-container'); // The chatroom page

    var $table = $('#high-scores'); //the high score table
    var $tableHeader = $('#table-header');

    // Prompt for setting a username
    var username;
    var password;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();
    var $passwordInput = $passwordInput.focus();

    var socket = io();



    const addParticipantsMessage = (data) => {
        var message = '';
        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    }

    // Sets the client's username
    const setUsername = () => {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();

            // Tell the server your username
            socket.emit('add user', username);
        }
    }

    const setPassword = () => {
        password = cleanInput($passwordInput.val().trim());

    }

    // Sends a chat message
    const sendMessage = () => {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
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
            .text(' ' + data.message);

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
    $passwordInput.keydown(event =>
    {
        $passwordInput.focus();

        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
                $passwordInput.fadeOut();
                $loginButton.fadeOut();
                $enterPasswordText.fadeOut();
            }
        }
    });

    $loginButton.click(event =>
    {
        if (username) {
            sendMessage();
            socket.emit('stop typing');
            typing = false;
        } else {
            setUsername();
            $passwordInput.fadeOut();
            $loginButton.fadeOut();
            $enterPasswordText.fadeOut();
        }
    });


    $usernameInput.keydown(event => {
        // Auto-focus the current input when a key is typed

        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
                $passwordInput.fadeOut();
                $loginButton.fadeOut();
                $enterPasswordText.fadeOut();
            }
        }
    });

    $inputMessage.keydown(event =>
    {
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
                $passwordInput.fadeOut();
                $loginButton.fadeOut();
                $enterPasswordText.fadeOut();
            }
        }
    });

    $inputMessage.on('input', () => {
        updateTyping();
    });

    const updateTable = data => {
        if (localStorage.jsSnakeGame) {
            var arr = JSON.parse(localStorage.jsSnakeGame);
            var html = "<tr id='table-header'><th>Username</th><th>Score</th><th>Rank</th></tr>";
            for (i = 0; i < arr.length; i++) {
                if (i == 10) {
                    break;
                }
                html += "<tr><td>" + arr[i].username + "</td><td>" + arr[i].score + "</td><td>" + (i+1) + "</td></tr>"
            }
            $('.table tbody').html(html);
        } else {
            console.log('did not detect any users in localstorage');
            $('.table tbody').html('<tr><td>no users found</td></tr>');
        }
    }


    setInterval(function(){ 
        updateTable(localStorage);
    }, 1000);    

    // Click events

    // Focus input when clicking anywhere on login page
    $loginPage.click(() => {
        $currentInput.focus();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(() => {
        $inputMessage.focus();
    });

    // Whenever the server emits 'login', log the login message
    socket.on('login', (data) => {
        connected = true;
        // Display the welcome message
        var message = "Welcome to Snake game Chat – ";
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', (data) => {
        addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', (data) => {
        log(data.username + ' joined');
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', (data) => {
        log(data.username + ' left');
        addParticipantsMessage(data);
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

    socket.on('disconnect', () => {
        log('you have been disconnected');
    });

    socket.on('reconnect', () => {
        log('you have been reconnected');
        if (username) {
            socket.emit('add user', username);
        }
    });

    socket.on('reconnect_error', () => {
        log('attempt to reconnect has failed');
    });

});

