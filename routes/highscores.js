const { Router } = require("express");
const { MongoClient: mongo } = require("mongodb");
const router = Router();

mongo
    .connect(
        "mongodb+srv://snakeapp:snakepass@cluster0-5kgg2.mongodb.net/highscores?retryWrites=true",
        { useNewUrlParser: true }
    )
    .then(client => client.db("snake-game"))
    .then(db => db.collection("highscores"))
    .then(collection => {
        /**
         * @route   GET /api/highscores/:username
         * @desc    Respond with the top 5 highscores of the player.
         */
        router.get("/:username", (req, res) => {
            const { username } = req.params;
            collection
                .findOne(
                    { username },
                    { projection: { _id: 0, highscores: 1 } }
                )
                .then(result => {
                    if (result === null) { 
                        res.send([]) 
                    } else {
                        const { highscores } = result;
                        const top5 = highscores.sort().reverse().slice(0, 5);
                        res.send(top5);
                    }
                }).catch(error => {
                    console.log(error);
                    res.send("error");
                });
        });
        /**
         * @route   POST /api/highscores
         * @desc    
            Update a players highscore, push new value to highscores, matching on username;
            When no document is found, create one with the username;
            If no highscores field of array type exists, create one and add highscore;
         */
        router.post("/", (req, res) => {
            const { username, highscore } = req.body;
            collection
                .updateOne(
                    { username },
                    { $push: { highscores: highscore } },
                    { upsert: true }
                )
                .then(updateWriteOpResult => {
                    res.redirect(`/api/highscores/${username}`);
                })
                .catch(error => {
                    console.log(error);
                    res.send("error")
                });
        });
    })
    .catch(error => console.log(error));

module.exports = router;
