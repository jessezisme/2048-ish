$(document).ready(function () {
    window.game = new Game(4);
    window.game.initialize();
})

/*
* Game Board 
*/
function Game(size) {
    this.rows = size
    this.columns = size;
    // Board is set as 2d array, with grid cell object for each position
    this.board = [];
}
Game.prototype.initialize = function () {
    this.initBoard();
    this.initTile();
    this.initEventListeners();
}
/* Initial grid */
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
    var emptyCell = this.getRandomEmptyCell();
    var tile = new Tile(emptyCell.x, emptyCell.y, game);




    // var x = this.board[emptyCell.x][emptyCell.y]
    // x.tilesArray.push(tile);




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
                self.move.left();
                break;
            // up 
            case 38:
                self.move.up();
                break;
            // right
            case 39:
                self.move.right();
                break;
            // down 
            case 40:
                self.move.down();
                break;
        }
    });
};
/**/
/* Get Empty Cells*/
Game.prototype.getEmptyCells = function () {
    var flatBoard = _.flatten(this.board);
    var empty = _.filter(flatBoard, function (val) {
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
Game.prototype.move = {
    up: function () { 
    },
    right: function () { },
    down: function () { },
    left: function () { }
};
/**/

/*
* Tile
*/
function Tile(x, y, game) {
    this.game = game; 
    // jQuery element  
    this.el;
    // Positioning
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
/* Set position */
Tile.prototype.setPosition = function(getX, getY) {
    this.x = getX;
    this.y = getY;    
    this.game.board[getX][getY].tilesArray.push(this); 
};
/**/
/* Remove from old position */
Tile.prototype.removeOldPosition = function(getX, getY) {
    this.game.board[getX][getY].tilesArray.pop(); 
}
/**/
/* Animate to Position */
Tile.prototype.animatePosition = function (initalizeFlag) {
    var fromLeft = this.x * (100 / this.game.rows);
    var fromTop = this.y * (100 / this.game.columns);
    // Initialize flag sets animationDuration to 0 to append immediately in correct position    
    var animationDuration = initalizeFlag ? 0 : 400;
    // Animate to correct position    
    this.el.animate({
        top: fromTop + "%",
        left: fromLeft + "%"
    }, animationDuration);
}
/**/

Tile.prototype.moves = {
    moveCounter: 0, 
    canMove: function() {
        this.moves.moveCounter = 0; 
        this.moves.up(); 
        this.moves.right(); 
        this.moves.down(); 
        this.moves.left(); 
        this.moves.moveCounter > 0 ? true : false; 
    },  
    up: function() {     
        var getAbove = this.game.board[this.x - 1][this.y]; 

        this.x === 0 ? false : true; 

        if (getAbove && getAbove.tilesArray.length === 1 && getAbove.tilesArray[0].valueProp === this.valueProp) {          
            this.setPosition(this.x - 1, this.y); 
            this.removeOldPosition(this.x, this.y); 

            this.movesCounter += 1; 
        }
        else if (getAbove && getAbove.tilesArray.length === 0) {     
            this.setPosition(this.x - 1, this.y); 
            this.removeOldPosition(this.x, this.y);      

            this.movesCounter += 1; 
            this.up(); 
        }      

    }
}

