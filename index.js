const express = require('express')
const path = require('path');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');

var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('new message', (data) => {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
        console.log(`Got the following data: ${data}`);
    });

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

let highScores = [];

app.get('/', (req, res) => {
    console.log(highScores);
    res.render('index.ejs', { highScores: highScores });
    highScores = [];
});


app.post('/', (req, res) => {

    let data = req.body;
    console.log(data);

    if (data) {
        for (i in data) {
            highScores.push([i, Number(data[i])]);
        }
    }

    highScores.sort((a, b) => { return b[1] - a[1] });
    res.status(200).send(JSON.stringify(highScores));
    
})

server.listen(port, () => console.log(`Snake game listening on port ${port}!`));

