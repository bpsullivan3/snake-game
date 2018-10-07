function getHighScore() {
    document.getElementById('high-score').addEventListener('click', function () {
        if (localStorage.jsSnakeHighScore == undefined) alert('You have not played this game yet!');
        else
            alert('Your current high score is ' + localStorage.jsSnakeHighScore + '.');
    });
}
getHighScore();