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
    // board is set as 2d array, with grid cell object for each position
    this.board = [];
    this.boardFlatten = function() {
        return _.flatten(this.board);
    }; 
    this.score = 0; 
  
    this.moveInProgress = false; 

}
Game.prototype.initialize = function () {
    this.initBoard();
    this.initTile();
    this.initEventListeners();
}

/**
 * Initialize grid 
 */
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
    // create 2d array and push grid cell object     
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
/**
 * Initialize tiles 
 */
Game.prototype.initTile = function () {
    
    this.isGameOver(); 
  
    var emptyCell = this.getRandomEmptyCell();        
    var tile = new Tile(emptyCell.x, emptyCell.y, game);
  
    this.isGameOver(); 
}
/**/

/**
 * Set event listeners
 */
Game.prototype.initEventListeners = function () {
    var self = this;
    /* keypress events for up, down, left, right */
    $('body').on('keydown', function (event) {       
        switch (event.which) {
            // left 
            case 37:
                self.move("left");
                break;
            // up 
            case 38:
                self.move("up");
                break;
            // right
            case 39:
                self.move("right");
                break;
            // down 
            case 40:
                self.move("down");
                break;
        }
    });
};
/**/

/**
 * Game is WON!
 */
Game.prototype.gameWon = function() {
    alert("you won"); 
}
/**/

/**
 * Game is LOST!
 */
Game.prototype.gameLost = function() {
    alert("what a loser!");
}
/**/

/**
 * Check if game over
 */
Game.prototype.isGameOver = function() {
    var gameBoard = this.boardFlatten(); 

    var is2048 = false; 
    var canAnyTileMove = false; 
    var hasEmptyCells = false; 

    // check if 2048
    gameBoard.forEach(function(val, index, array) {
        val.tilesArray.forEach(function(val, index, array) {
            if (val.valueProp === 2048) {
                is2048 = true; 
            } 
        });
    })
    // check if there are empty cells 
    if (this.getEmptyCells().length > 0) {
        hasEmptyCells = true; 
    }     
    // Check if move possible
    gameBoard.forEach(function(val, index, array) {
        val.tilesArray.forEach(function(val, index, array) {
            val.moveCheck(); 
            if (val.canMove === true) {
                canAnyTileMove = true; 
            }
        });
    });   
    
    // if game won
    if (is2048) {
        this.gameWon(); 
        return true; 
    }
    // if no empty cells || no tile can move, the game is lost
    else if ( !hasEmptyCells && !canAnyTileMove) {
        this.gameLost(); 
        return true; 
    }
    // if there is an empty || a tile can move, return false for isGameOver
    else {
        return false; 
    }
    //     
};

/**
 * Get empty cells
 */
Game.prototype.getEmptyCells = function () {
    var emptyCells = _.filter(this.boardFlatten(), function (val) {
        return !val.tilesArray.length;
    });
    return emptyCells;
};
/**/

/**
 * Return random empty cell for new tile creation
 */
Game.prototype.getRandomEmptyCell = function () {
    var emptyGridCells = this.getEmptyCells();
    var randomIndex = Math.floor(Math.random() * Math.floor(emptyGridCells.length));
 
    return emptyGridCells[randomIndex];
};
/**/

/**
 * Merge tiles
 */
Game.prototype.TileMerge = function() {
    var gameBoard = this.boardFlatten(); 
    var newScore = this.score; 

    // loop through all tiles
    gameBoard.forEach(function(val, index, array) {  

        // @TODO: temporary error handling 
        if (val.tilesArray.length > 2) {
            console.log("val:")
            console.log(val); 
            console.log("index: " + index);           
            throw "Too many tiles in Tile Array"
        }
        // end @TODO

        if (val.tilesArray.length === 2) {
            // get current value of 1st tile
            var currentValue = val.tilesArray[0].valueProp; 
            // update value
            val.tilesArray[0].valueProp = currentValue * 2;  
            // remove 2nd tile
            val.pop();
            // update score
            newScore += currentValue;  
        }
    }); 
    // update game score at the end
    this.score = newScore; 
}
/**/

/**
 * Move animations 
 */
Game.prototype.moveAnimations = function(gameBoard) {
  var self = this; 
  var promiseArray = []; 
  
  if (this.moveInProgress) {
    return false; 
  }
  
  this.moveInProgress = true; 
  gameBoard.forEach(function(val, index, array) {        
      val.tilesArray.forEach(function(val, index, array) {
        promiseArray.push(val.animatePosition())
      })
  });
    
  $.when.apply($, promiseArray).then(function() {
    self.moveInProgress = false; 
  });
  if (promiseArray.length === 0) {
    self.moveInProgress = false; 
  }   
  
};
/**/

/**
 * Move logic 
 */
Game.prototype.move = function(getDirection) {
    // direction passed as argument
    var direction = getDirection.toLowerCase(); 
    var gameBoard; 
  
    if (this.moveInProgress) {
      return false; 
    }
  
    // if UP:
    if (direction === "up") {
        gameBoard = _.orderBy(this.boardFlatten(), "y", "asc");
    }
    // if RIGHT:
    else if (direction === "right") {
        gameBoard = _.orderBy(this.boardFlatten(), "x", "desc");
    }
    // if DOWN
    else if (direction === "down") {
        gameBoard = _.orderBy(this.boardFlatten(), "y", "desc");
    }
    // if LEFT
    else if (direction === "left") {
        gameBoard = _.orderBy(this.boardFlatten(), "y", "asc");
    }
    // loop through all tiles and run tile move foreach
    gameBoard.forEach(function(val, index, array) {
        val.tilesArray.length ? val.tilesArray.forEach(function(val){val.move(direction)}) : false; 
    }); 
    // run animation logic at the end
    this.moveAnimations(gameBoard); 
}
/**/




/*
* Tile
*/
function Tile(x, y, game) {
    this.game = game; 

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
    // can move flag
    this.canMove = false; 
    // initialize
    this.initialize();
};

/**
 * Initialize
 */
Tile.prototype.initialize = function() {
    // Get html from template and set number text      
    var getTile = $.parseHTML($("#template_tile").html());
    this.el = $(getTile);
    this.el.find(".tile_number").html(this.valueProp);
    // Set position and append to page; initializeFlag is set to True to remove animation and append immediately in correct position   
    this.setPosition(this.x, this.y);
    this.animatePosition(true);
    this.el.appendTo(".tile-container");
};
/**/

/**
 * Set new position
 */
Tile.prototype.setPosition = function(getX, getY) {
    this.x = getX;
    this.y = getY; 
    this.game.board[getX][getY].tilesArray.push(this);                
};
/**/

/**
 * Remove old position
 */
Tile.prototype.removeOldPosition = function(getX, getY) {
    this.game.board[getX][getY].tilesArray.pop(); 
};
/**/

/**
 * Animate to position
 */
Tile.prototype.animatePosition = function (initalizeFlag) {
    var fromLeft = this.x * (100 / this.game.rows);
    var fromTop = this.y * (100 / this.game.columns);
    // Initialize flag sets animationDuration to 0 to append immediately in correct position    
    var animationDuration = initalizeFlag ? 0 : 250;
    // Add animation class as flag for in-progress
    this.el.addClass("animate");
  
    // Animate to correct position    
    // this.el.animate({
    //     top: fromTop + "%",
    //     left: fromLeft + "%"
    // }, animationDuration, function() {
    //     $(this).removeClass("animate"); 
    // });   
    
  var getPromise = this.el.animate({
        top: fromTop + "%",
        left: fromLeft + "%"
    }, animationDuration).promise(); 
  
  getPromise.done(function() {
    $(this).removeClass("animate")
  })
  
  return getPromise; 
    
  
};
/**/

/**
 * Check if move is possible
 */
Tile.prototype.moveCheck = function() {
    // run all checks; return true if any moves are possible
    if (  this.move("up", true) || this.move("right", true) || this.move("down", true) || this.move("left", true)  ) {
        this.canMove = true; 
        return true; 
    }  
    else {
        this.canMove = false; 
        return false; 
    }
    // this.move("up", true) || this.move("right", true) || this.move("down", true) || this.move("left", true) ? true : false; 
};
/**/

/**
 * Move logic  
 */
Tile.prototype.move = function(getDirection, checkFlag) {

    var checkFlag = checkFlag ? true : false; 
    var direction = getDirection.toLowerCase(); 
    var getX = this.x; 
    var getY = this.y; 

    var getNext; 
    var isNextMatch; 
    var isNextEmpty; 
    var nextPositionArray = []; 

    // if UP: check next position
    if (direction === "up") {
        getNext = this.y > 0 ? this.game.board[this.x][this.y - 1] : false; 
        nextPositionArray.push(this.x, this.y - 1);
    }
    // if RIGHT: check next position
    else if (direction === "right") {
        getNext = this.x < 3 ? this.game.board[this.x + 1][this.y] : false; 
        nextPositionArray.push(this.x + 1, this.y); 
    }
    // if DOWN: check next position   
    else if (direction === "down")  {
        getNext = this.y < 3 ? this.game.board[this.x][this.y + 1] : false; 
        nextPositionArray.push(this.x, this.y + 1);         
    }
    // if LEFT: check next position
    else if (direction === "left") {
        getNext = this.x > 0 ? this.game.board[this.x - 1][this.y] : false;
        nextPositionArray.push(this.x - 1, this.y); 
    }
    // Check if next position contains match or is empty
    isNextMatch = getNext && getNext.tilesArray.length === 1 && getNext.tilesArray[0].valueProp === this.valueProp; 
    isNextEmpty = getNext && getNext.tilesArray.length === 0; 
    // 

    // "check only" mode; only to check if tile can move 
    if (checkFlag) {
        return isNextEmpty || isNextMatch ? true : false; 
    }
    // not "check only" mode; will actually run move logic
    else if (isNextEmpty || isNextMatch) {
        this.setPosition(nextPositionArray[0], nextPositionArray[1] );
        this.removeOldPosition(getX, getY);
        // do NOT continue to move if a tile has matched - and therefore MERGED into adjoining tile
        if (!isNextMatch) {
            this.move(direction)
        }
    }

}
/**/

