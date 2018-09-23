Feature: Snake Game

    Scenario: Starting a game
        Given a user 
        When it clicks on play button
        Then snake should move in direction of the arrow key that was pressed

    Scenario: eating a block
        Given a game that has started
        When the snake touches a food block
        Then snake appends food block to it's opposite side
        And score gets updated

    Scenario: Snake touches itself
        Given a game that has started
        When the snake touches its own body
        Then game over
        And if score is higher than high score, score gets saved
        And show game over modal 

    Scenario: Snake touches a wall
        Given a game that has started
        When the snake touches a wall
        Then game over
        And if score is higher than high score, score gets saved
        And show game over modal 