$(document).ready(function () {
    window.game = new Game(4);
    window.game.initialize();
});
/*
* Game Board 
*/
function Game(size) {
    this.rows = size
    this.columns = size;
    // Board is set as 2d array, with grid cell object for each position
    this.board = [];
    this.boardFlatten = function() {
        return _.flatten(this.board);
    }; 
    this.score = 0; 
    this.tileID = 0; 
}
Game.prototype.initialize = function () {
    this.initBoard();
    this.initTile();
    this.initEventListeners();
}
/* Initialize grid */
Game.prototype.initBoard = function () {
    // return grid cell object      
    function initGridCell(x, y) {
        var getGridCell = $.parseHTML($("#template_grid_cell").html());
        $(getGridCell).appendTo(".grid");
        return {
            x: x,
            y: y,
            tilesArray: []
        }
    }
    // Create 2d array and push grid cell object     
    for (var x = 0; x < this.rows; x++) {
        var newArray = [];
        this.board.push(newArray);
        for (var y = 0; y < this.columns; y++) {
            var gridObj = initGridCell(x, y);
            var rowCell = this.board[x];
            rowCell.push(gridObj);
        }
    }
};
Game.prototype.initTile = function () {
    this.tileID += 1; 
    var emptyCell = this.getRandomEmptyCell();        
    var tile = new Tile(emptyCell.x, emptyCell.y, game);
}
/**/
/* Set event listeners */
Game.prototype.initEventListeners = function () {
    var self = this;
    /* Keypress events for up, down, left, right */
    $('body').on('keydown', function (event) {
        switch (event.which) {
            // left 
            case 37:
                self.moveLeft();
                break;
            // up 
            case 38:
                self.moveUp();
                break;
            // right
            case 39:
                self.moveRight();
                break;
            // down 
            case 40:
                self.moveDown();
                break;
        }
    });
};
/**/
/* Get Empty Cells*/
Game.prototype.getEmptyCells = function () {
    var empty = _.filter(this.boardFlatten(), function (val) {
        return !val.tilesArray.length;
    });
    return empty;
};
/**/
/* Return random empty cell for new tile creation */
Game.prototype.getRandomEmptyCell = function () {
    var emptyGridCells = this.getEmptyCells();
    var randomIndex = Math.floor(Math.random() * Math.floor(emptyGridCells.length));
 
    return emptyGridCells[randomIndex];
};
/**/
/* Move Controller Object */
Game.prototype.moveAnimations = function(gameBoard) {
    gameBoard.forEach(function(val, index, array) {
        val.tilesArray.length ? val.tilesArray.forEach(function(val){val.animatePosition()}) : false; 
    });
};
Game.prototype.moveUp = function() {
    var gameBoard = _.orderBy(this.boardFlatten(), "y", "asc"); 
    gameBoard.forEach(function(val, index, array) {
        val.tilesArray.length ? val.tilesArray.forEach(function(val){val.moveUp(false)}) : false; 
    })
    this.moveAnimations(gameBoard); 
};
Game.prototype.moveRight = function() {
    var gameBoard = _.orderBy(this.boardFlatten(), "x", "desc"); 
    gameBoard.forEach(function(val, index, array) {
        val.tilesArray.length ? val.tilesArray.forEach(function(val){val.moveRight(false)}) : false; 
    }); 
    this.moveAnimations(gameBoard); 
}; 
Game.prototype.moveDown = function() {   
    var gameBoard = _.orderBy(this.boardFlatten(), "y", "desc");
    gameBoard.forEach(function(val, index, array) {
        val.tilesArray.length ? val.tilesArray.forEach(function(val){val.moveDown(false)}) : false; 
    }); 
    this.moveAnimations(gameBoard); 
};
Game.prototype.moveLeft = function() {
    var gameBoard = _.orderBy(this.boardFlatten(), "y", "asc"); 
    gameBoard.forEach(function(val, index, array) {
        val.tilesArray.length ? val.tilesArray.forEach(function(val){val.moveLeft(false)}) : false; 
    }); 
    this.moveAnimations(gameBoard); 
};
/**/

/* Check if game over */
Game.prototype.isGameOver = function() {
    // Check if 2048 is reached
    
    // Check if empty cell exists

    // Check if move possible
};


/*
* Tile
*/
function Tile(x, y, game) {
    this.game = game; 
    this.id = game.tileID; 
    // jQuery element  
    this.el;
    // current position
    this.x = x;
    this.y = y;
    // Getter/Setter for value; updates html on set; defaulted to 2 on creation 
    this.valueProp = 2;
    Object.defineProperties(this, {
        "value": {
            "get": function () {
                return this.valueProp;
            },
            "set": function (val) {
                this.valueProp = val;
                this.el.find(".tile_number").html(this.valueProp);
            }
        }
    });
    this.initialize();
};
/* Initialize */
Tile.prototype.initialize = function() {
    // Get html from template and set number text      
    var getTile = $.parseHTML($("#template_tile").html());
    this.el = $(getTile);
    this.el.find(".tile_number").html(this.valueProp);
    //Set position and append to page; initializeFlag is set to True to remove animation and append immediately in correct position   
    this.setPosition(this.x, this.y);
    this.animatePosition(true);
    this.el.appendTo(".tile-container");
};
/**/
/* Set new position and remove previous position */
Tile.prototype.setPosition = function(getX, getY) {
    this.x = getX;
    this.y = getY; 
    this.game.board[getX][getY].tilesArray.push(this);                
};
/**/
/* Remove from old position */
Tile.prototype.removeOldPosition = function(getX, getY) {
    this.game.board[getX][getY].tilesArray.pop(); 
};
/**/
/* Animate to Position */
Tile.prototype.animatePosition = function (initalizeFlag) {
    var fromLeft = this.x * (100 / this.game.rows);
    var fromTop = this.y * (100 / this.game.columns);
    // Initialize flag sets animationDuration to 0 to append immediately in correct position    
    var animationDuration = initalizeFlag ? 0 : 400;
    // Add animation class as flag for in-progress
    this.el.addClass("animate");
    // Animate to correct position    
    this.el.animate({
        top: fromTop + "%",
        left: fromLeft + "%"
    }, animationDuration, function() {
        $(this).removeClass("animate"); 
    });        
};
/**/
/* Move logic */
Tile.prototype.moveCheck = function() {
    // run all checks; return true if any moves are possible  
    this.move("up", true) || this.move("right", true) || this.move("down", true) || this.move("left", true) ? true : false; 
};

Tile.prototype.move = function(getDirection, checkFlag) {

    var checkFlag = checkFlag ? true : false; 
    var direction = getDirection; 
    var getX = this.x; 
    var getY = this.y; 

    var getNext; 
    var isNextMatch; 
    var isNextEmpty; 
    var nextPositionArray = []; 

    // if UP: check next position
    if (direction.toLowerCase() === "up") {
        getNext = this.y > 0 ? this.game.board[this.x][this.y - 1] : false; 
        nextPositionArray.push(this.x, this.y - 1);
    }
    // if RIGHT: check next position
    else if (direction.toLowerCase() === "right") {
        getNext = this.x < 3 ? this.game.board[this.x + 1][this.y] : false; 
        nextPositionArray.push(this.x + 1, this.y); 
    }
    // if DOWN: check next position   
    else if (direction.toLowerCase() === "down")  {
        getNext = this.y < 3 ? this.game.board[this.x][this.y + 1] : false; 
        nextPositionArray.push(this.x, this.y + 1);         
    }
    // if LEFT: check next position
    else if (direction.toLowerCase() === "left") {
        getNext = this.x > 0 ? this.game.board[this.x - 1][this.y] : false;
        nextPositionArray.push(this.x - 1, this.y); 
    }
    // Check if next position contains match or is empty
    isNextMatch = getNext && getNext.tilesArray.length === 1 && getNext.tilesArray[0].valueProp === this.valueProp; 
    isNextEmpty = getNext && getNext.tilesArray.length === 0; 
    // 

    if ( !checkFlag && (isNextEmpty || isNextMatch) ) {
        this.setPosition(nextPositionArray[0], nextPositionArray[1] )
    }  
    else {
        return isNextEmpty || isNextMatch ? true : false; 
    }

}




Tile.prototype.moveUp = function(runCheckOnly) {    
    var checkFlag = runCheckOnly;   
    var getNext = this.y > 0 ? this.game.board[this.x][this.y - 1] : false; 
    var isNextMatch = getNext && getNext.tilesArray.length === 1 && getNext.tilesArray[0].valueProp === this.valueProp; 
    var isNextEmpty = getNext && getNext.tilesArray.length === 0; 
    var getX = this.x; 
    var getY = this.y; 

    if (checkFlag) {
        return isNextEmpty || isNextMatch ? true : false; 
    }
    else if (isNextMatch || isNextEmpty) { 
        this.setPosition(this.x, this.y - 1); 
        this.removeOldPosition(getX, getY);
        // keep moving, if empty and not already a merging tile
        isNextEmpty ? this.moveUp() : false; 
    }
};
Tile.prototype.moveRight = function(runCheckOnly) {
    var checkFlag = runCheckOnly; 
    var getNext = this.x < 3 ? this.game.board[this.x + 1][this.y] : false; 
    var isNextMatch = getNext && getNext.tilesArray.length === 1 && getNext.tilesArray[0].valueProp === this.valueProp; 
    var isNextEmpty = getNext && getNext.tilesArray.length === 0; 
    var getX = this.x; 
    var getY = this.y; 

    if (checkFlag) {
        return isNextEmpty || isNextMatch ? true : false; 
    }
    else if (isNextEmpty || isNextMatch) {
        this.setPosition(this.x + 1, this.y); 
        this.removeOldPosition(getX, getY);
        // keep moving, if empty and not already a merging tile
        isNextEmpty ? this.moveRight() : false; 
    }
};
Tile.prototype.moveDown = function() {
    var checkFlag = runCheckOnly; 
    var getNext = this.y < 3 ? this.game.board[this.x][this.y + 1] : false; 
    var isNextMatch = getNext && getNext.tilesArray.length === 1 && getNext.tilesArray[0].valueProp === this.valueProp; 
    var isNextEmpty = getNext && getNext.tilesArray.length === 0; 
    var getX = this.x; 
    var getY = this.y; 

    if (checkFlag) {
        return isNextEmpty || isNextMatch ? true : false; 
    }
    else if (isNextEmpty || isNextMatch) {
        this.setPosition(this.x, this.y + 1); 
        this.removeOldPosition(getX, getY);
        // keep moving, if empty and not already a merging tile
        isNextEmpty ? this.moveDown() : false; 
    }
}; 
/**/
Tile.prototype.moveLeft = function() {
    var checkFlag = runCheckOnly; 
    var getNext = this.x > 0 ? this.game.board[this.x - 1][this.y] : false; 
    var isNextMatch = getNext && getNext.tilesArray.length === 1 && getNext.tilesArray[0].valueProp === this.valueProp; 
    var isNextEmpty = getNext && getNext.tilesArray.length === 0; 
    var getX = this.x; 
    var getY = this.y; 

    if (checkFlag) {
        return isNextEmpty || isNextMatch ? true : false; 
    }
    else if (isNextEmpty || isNextMatch) {
        this.setPosition(this.x - 1, this.y); 
        this.removeOldPosition(getX, getY);
        // keep moving, if empty and not already a merging tile
        isNextEmpty ? this.moveDown() : false; 
    }
}; 
/**/

