/**
* This class manages the food which the snake will eat.
* @class Food
* @constructor
* @namespace SNAKE
* @param {Object} config The configuration object for the class. Contains playingBoard (the SNAKE.Board that this food resides in).
*/

export default class Food {

    instanceNumber = 0;

    constructor(config) {
        if (!config || !config.playingBoard) { return; }
        this.playingBoard = config.playingBoard;
        this.fRow = fRow;
        this.fColumn = fColumn;
        this.myId = instanceNumber++;
        var elmFood = document.createElement("div");
        elmFood.setAttribute("id", "snake-food-" + myId);
        elmFood.className = "snake-food-block";
        elmFood.style.width = playingBoard.getBlockWidth() + "px";
        elmFood.style.height = playingBoard.getBlockHeight() + "px";
        elmFood.style.left = "-1000px";
        elmFood.style.top = "-1000px";
        playingBoard.getBoardContainer().appendChild(elmFood);
    }

    getRandomPosition(x, y) {
        return Math.floor(Math.random() * (y + 1 - x)) + x;
    }


    getFoodElement() {
        return elmFood;
    };

    randomlyPlaceFood(playingBoard) {
        // if there exist some food, clear its presence from the board
        if (playingBoard.grid[fRow] && playingBoard.grid[fRow][fColumn] === playingBoard.getGridFoodValue()) {
            playingBoard.grid[fRow][fColumn] = 0;
        }

        var row = 0, col = 0, numTries = 0;

        var maxRows = playingBoard.grid.length - 1;
        var maxCols = playingBoard.grid[0].length - 1;

        while (playingBoard.grid[row][col] !== 0) {
            row = getRandomPosition(1, maxRows);
            col = getRandomPosition(1, maxCols);

            // in some cases there may not be any room to put food anywhere
            // instead of freezing, exit out
            numTries++;
            if (numTries > 20000) {
                row = -1;
                col = -1;
                break;
            }
        }

        playingBoard.grid[row][col] = playingBoard.getGridFoodValue();
        fRow = row;
        fColumn = col;
        elmFood.style.top = row * playingBoard.getBlockHeight() + "px";
        elmFood.style.left = col * playingBoard.getBlockWidth() + "px";
    };
}