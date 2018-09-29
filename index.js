const express = require('express')
const path = require('path');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static(path.join(__dirname, 'public')));

var numUsers = 0;

let highScores = [];

io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('new message', (data) => {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
        console.log(`Got the following data: ${data}`);
    });

    socket.on('new highscore', data => {
        if (highScores.length > 0) {
            for (i = 0; i < highScores.length; i++) {
                if (highScores[i].useraname != data.username) {
                    for (i in data) {
                        var obj = {
                            username: i,
                            score: data[i]
                        }
                        highScores.push(obj);
                    }
                    if (highScores.length > 1) {
                        highScores.sort((a, b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));
                    }
                    socket.broadcast.emit('new highscore', highScores);
                }
            }
        } else {
            var obj = {
                username: data.username,
                score: data.score
            }
            highScores.push(obj);
            socket.broadcast.emit('new highscore', highScores);
        }
        console.log("High Score list is currently: " + JSON.stringify(highScores));
        
    })

    socket.on('add user', username => {
        if (addedUser) return;

        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });

        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        })
    })

    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        })
    })

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        })
    })

    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;
            socket.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            })
        }
    });
});

app.get('/', (req, res) => {    
    res.sendFile('index.html');
});

server.listen(port, () => console.log(`Snake game listening on port ${port}!`));

