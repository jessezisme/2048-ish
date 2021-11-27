import '../style/main.scss';

let gameInstance;
const TILE_HTML_STRING = `<div class="tile"> <span class="tile_number"> </span> </div>`;
const GRID_CELL_HTML_STRING = `<div class="grid_cell"></div>`;
const ANIMATION_DURATION = 175;

/**
 * Game Board
 * @param {number} size for setting board row and column size
 */
function Game(size) {
    // board is set as 2d array, with grid cell object for each position
    this.board = [];
    this.boardFlat = () => this.board.flat();
    // set board size
    this.rows = size;
    this.columns = size;
    // score setup
    this.score = 0;
    // flag to check whether any tile movement is in progress;
    this.moveInProgress = false;
    // track event listeners
    this.eventListenerArray = [];
}

/**
 * Used for adding all Game event listeners,
 * so all events can be tracked and removed when Game is destroyed or restarted to prevent memory leaks.
 * @param {Object} eventElement - DOM element for attached listener
 * @param {String} eventName - name of event, which should be same event name used for addEventListener
 * @param {Function} eventCallback - event callback
 */
Game.prototype.addEventListenerHelper = function (eventElement, eventName, eventCallback) {
    if (eventElement) {
        eventElement.addEventListener(eventName, eventCallback);
    }
    this.eventListenerArray.push({
        eventElement: eventElement,
        eventName: eventName,
        eventCallback: eventCallback,
    });
};

/**
 * Remove all Game event listeners.
 * used before destroying or restarting game to prevent memory leaks
 */
Game.prototype.removeEventListenerHelper = function () {
    this.eventListenerArray.forEach((eventData) => {
        eventData.eventElement.removeEventListener(eventData.eventName, eventData.eventCallback);
    });
    this.eventListenerArray = [];
};

/**
 * Get flattened game board containing only empty cells
 * @returns {Array} flattened board array containing cells that are empty (i.e. no tiles)
 */
Game.prototype.getEmptyCells = function () {
    return this.boardFlat().filter((val) => !val.tilesArray.length);
};

/**
 * Get a random empty grid cell object
 * @returns {Object} game board cell that is empty
 */
Game.prototype.getRandomEmptyCell = function () {
    const emptyGridCells = this.getEmptyCells();
    const randomIndex = Math.floor(Math.random() * Math.floor(emptyGridCells.length));

    return emptyGridCells[randomIndex];
};

/**
 * Notify when game is won
 */
Game.prototype.gameWon = function () {
    alert('You won. A winner is you!');
};

/**
 * Notify when game is lost
 */
Game.prototype.gameLost = function () {
    alert("You lost. You're not that guy, pal.");
};

/**
 * Check if game is won
 * by checking all tiles for 2048 value
 * @returns {Boolean} is the game won (i.e. reached 2048)
 */
Game.prototype.isGameWon = function () {
    let isGameWon = false;

    this.boardFlat().forEach((cell) => {
        cell.tilesArray.forEach((cellTile) => {
            if (cellTile.valueProp === 2048) {
                isGameWon = true;
            }
        });
    });
    return isGameWon;
};

/**
 * Check if any tile can move,
 * lack of ability to move can be one reason game is over
 * @returns {Boolean} can any tile move
 */
Game.prototype.canAnyTileMove = function () {
    let canAnyTileMove = false;

    this.boardFlat().forEach((cell) => {
        cell.tilesArray.forEach((cellTile) => {
            cellTile.canMove = cellTile.isMoveable();
            if (cellTile.canMove === true) {
                canAnyTileMove = true;
            }
        });
    });
    return canAnyTileMove;
};

/**
 * Run check to determine game status
 * @returns {Boolean} is the game over (either by winning or losing)
 */
Game.prototype.isGameOver = function () {
    const isGameWon = this.isGameWon();
    const canAnyTileMove = this.canAnyTileMove();
    const hasEmptyCells = this.getEmptyCells().length > 0;

    if (isGameWon) {
        // game is won
        this.gameWon();
        return true;
    } else if (!hasEmptyCells && !canAnyTileMove) {
        // no empty cells and no ability to move is game over
        this.gameLost();
        return true;
    } else {
        // else game can go on
        return false;
    }
};

/**
 * Merge two tiles into one,
 * and set scoreboard when complete
 * @param {Array} game board
 */
Game.prototype.mergeTiles = function () {
    let newScore = this.score;

    // loop through all tiles
    this.boardFlat().forEach(function (val) {
        if (val.tilesArray.length === 2) {
            // get current value of 1st tile
            const currentValue = val.tilesArray[0].valueProp;
            // update value
            val.tilesArray[0].value = currentValue * 2;
            // remove 2nd tile
            const secondTile = val.tilesArray.pop();
            secondTile.el.remove();
            // update score
            newScore += currentValue;
        }
    });
    // update game score at the end
    this.setScoreboard(newScore);
};

/**
 * Move animations
 * @param {Array} boardSorted - game board sorted for movement priority
 */
Game.prototype.moveAnimations = function (boardSorted) {
    const self = this;
    const promiseArray = [];

    function runComplete() {
        self.moveInProgress = false;
        self.mergeTiles();
        self.initTile();
    }

    if (this.moveInProgress) {
        return false;
    }

    this.moveInProgress = true;
    boardSorted.forEach(function (val) {
        val.tilesArray.forEach(function (val) {
            promiseArray.push(val.animatePosition());
        });
    });

    if (promiseArray.length === 0) {
        runComplete();
    } else {
        Promise.all(promiseArray).then(runComplete);
    }
};

/**
 * Sort the game board by 'x' or 'y' position,
 * in either ascending 'asc' or descending 'desc' order.
 * This sorting is done to determine which tiles should be moved first based on movement direction:
 * For example, when moving left, the tiles farthest left move first.
 * @param {String} prop - the property to be used for sorting
 * @param {String} direction - accepted values are 'asc' and 'desc' for sorting in ascending or descending order
 * @returns {Array} sorted game board
 */
Game.prototype.getSortedBoardByPosition = function (prop, direction) {
    return this.boardFlat().sort((cellA, cellB) => {
        if (cellA[prop] < cellB[prop]) {
            // reverse if descending
            return direction === 'asc' ? -1 : 1;
        } else if (cellA[prop] > cellB[prop]) {
            // reverse if descending
            return direction === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });
};

/**
 * Move tiles
 * @param {String} getDirection - move direction: 'up', 'right', 'down', or 'left'
 */
Game.prototype.move = function (getDirection) {
    // direction passed as argument
    const direction = getDirection.toLowerCase();
    let gameBoard;
    // flag to check whether any
    let hasAnyTileMoved = false;

    // don't move again if already in process of moving
    if (this.moveInProgress) {
        return false;
    }

    if (direction === 'up') {
        // Up
        gameBoard = this.getSortedBoardByPosition('y', 'asc');
    } else if (direction === 'right') {
        // Right
        gameBoard = this.getSortedBoardByPosition('x', 'desc');
    } else if (direction === 'down') {
        // Down
        gameBoard = this.getSortedBoardByPosition('y', 'desc');
    } else if (direction === 'left') {
        // Left
        gameBoard = this.getSortedBoardByPosition('y', 'asc');
    }

    // loop through all tiles and run tile move foreach
    gameBoard.forEach(function (val) {
        val.tilesArray.length
            ? val.tilesArray.forEach(function (val) {
                  if (val.move(direction, true)) {
                      hasAnyTileMoved = true;
                      val.move(direction);
                  }
              })
            : false;
    });
    // run animation logic at the end
    hasAnyTileMoved ? this.moveAnimations(gameBoard) : false;
};

/**
 * Set scoreboard number
 * @param {Number} user score
 */
Game.prototype.setScoreboard = function (score) {
    const scoreElements = document.querySelectorAll('[data-js="score"]') || [];
    this.score = score;

    scoreElements.forEach((scoreElement) => {
        scoreElement.innerHTML = this.score.toString();
    });
};

/**
 * Create grid cell DOM element
 * @returns {Object} grid cell DOM element
 */
Game.prototype.createGridCellDOMElement = function () {
    const gridCellContainer = document.createElement('div');
    gridCellContainer.innerHTML = GRID_CELL_HTML_STRING;

    return gridCellContainer.firstChild;
};

/**
 * Initialize grid
 */
Game.prototype.initBoard = function () {
    // return grid cell object
    const initGridCell = (x, y) => {
        const gridEl = document.querySelector('.grid');
        const gridCellEl = this.createGridCellDOMElement();
        gridEl.append(gridCellEl);

        return {
            x: x,
            y: y,
            tilesArray: [],
        };
    };

    // create 2d array and push grid cell object
    for (let x = 0; x < this.rows; x++) {
        const newArray = [];
        this.board.push(newArray);
        for (let y = 0; y < this.columns; y++) {
            const gridObj = initGridCell(x, y);
            const rowCell = this.board[x];
            rowCell.push(gridObj);
        }
    }
};

/**
 * Initialize tiles
 */
Game.prototype.initTile = function () {
    // isGameOver determines whether the game is finished; needs to be run: before and after creating tile
    this.isGameOver();
    const emptyCell = this.getRandomEmptyCell();
    new Tile(emptyCell.x, emptyCell.y);
    // isGameOver determines whether the game is finished; needs to be run: before and after creating tile
    this.isGameOver();
};

/**
 * Set event listeners
 */
Game.prototype.initEventListeners = function () {
    const self = this;
    const getGameboard = document.getElementById('touchGameboard');

    // new game handler
    const newGameButton = document.querySelector('[data-js="newGame"]');
    this.addEventListenerHelper(newGameButton, 'click', gameStart);

    // touch events with Hammer.js
    window.hammertime && window.hammertime.destroy();
    window.hammertime = new Hammer(getGameboard, {
        recognizers: [
            [
                Hammer.Swipe,
                {
                    direction: Hammer.DIRECTION_ALL,
                },
            ],
        ],
    });
    window.hammertime
        .on('swipeleft', function () {
            self.move('left');
        })
        .on('swiperight', function () {
            self.move('right');
        })
        .on('swipedown', function () {
            self.move('down');
        })
        .on('swipeup', function () {
            self.move('up');
        });

    /*
        NOTE: Remove event listeners before applying new listeners,
        because this initialization runs each time a new game is created
    */
    // keypress events for up, down, left, right
    function arrowPress(event) {
        event.preventDefault();
        switch (event.keyCode) {
            // left
            case 37:
                self.move('left');
                break;
            // up
            case 38:
                self.move('up');
                break;
            // right
            case 39:
                self.move('right');
                break;
            // down
            case 40:
                self.move('down');
                break;
        }
    }

    this.addEventListenerHelper(document, 'keydown', arrowPress);
};

/**
 * Clear Grid and Tile Container UI
 */
Game.prototype.clearBoardUI = function () {
    const gridEl = document.querySelector('.grid');
    const tileContainerEl = document.querySelector('.tile-container');

    if (gridEl) {
        gridEl.innerHTML = '';
    }
    if (tileContainerEl) {
        tileContainerEl.innerHTML = '';
    }
};

Game.prototype.destroyGame = function () {
    this.removeEventListenerHelper();
};

/**
 * Run all initializations
 */
Game.prototype.initialize = function () {
    this.clearBoardUI();
    this.setScoreboard(0);
    this.initBoard();
    this.initTile();
    this.initEventListeners();
};

/**
 * Tiles
 * @param {Number} x - coordinate for x row
 * @param {Number} y - coordinate for y column
 */
function Tile(x, y) {
    this.game = gameInstance;
    // element
    this.el;
    // current position
    this.x = x;
    this.y = y;
    // Getter/Setter for value; updates html on set; defaulted to 2 on creation
    this.valueProp = 2;
    Object.defineProperties(this, {
        value: {
            get: function () {
                return this.valueProp;
            },
            set: function (val) {
                this.valueProp = val;
                const tileNumberEl = this.el.querySelector('.tile_number');
                tileNumberEl.innerHTML = this.valueProp;
                tileNumberEl.setAttribute('data-value', val);
            },
        },
    });
    // can move flag
    this.canMove = false;
    // initialize
    this.initialize();
}

/**
 * Create a tile DOM element
 * @returns {Object} tile DOM element
 */
Tile.prototype.createTileDOMElement = function () {
    const tileContainer = document.createElement('div');
    tileContainer.innerHTML = TILE_HTML_STRING;
    return tileContainer.firstChild;
};

/**
 * Initialize tiles
 */
Tile.prototype.initialize = function () {
    const tileContainerEl = document.querySelector('.tile-container');
    this.el = this.createTileDOMElement();
    const tileNumberEl = this.el.querySelector('.tile_number');
    tileNumberEl.innerHTML = this.valueProp;
    tileNumberEl.setAttribute('data-value', 2);
    // Set position and append to page; initializeFlag is set to True to remove animation and append immediately in correct position
    this.setPosition(this.x, this.y);
    this.animatePosition(true);
    // append to board
    tileContainerEl.append(this.el);
};

/**
 * Set tile position
 * @param {Number} getX - x row coordinate
 * @param {Number} getY - y column coordinate
 */
Tile.prototype.setPosition = function (getX, getY) {
    this.x = getX;
    this.y = getY;
    this.game.board[getX][getY].tilesArray.push(this);
};

/**
 * Remove previous tile position
 * @param {Number} getX - x row coordinate
 * @param {Number} getY - y column coordinate
 */
Tile.prototype.removeOldPosition = function (getX, getY) {
    this.game.board[getX][getY].tilesArray.pop();
};

/**
 * Animate tiles to position
 * @param {Boolean} initalizeFlag - if the tile is being added to board for first time
 */
Tile.prototype.animatePosition = function (initalizeFlag) {
    const self = this;
    const fromLeft = this.x * (100 / this.game.rows);
    const fromTop = this.y * (100 / this.game.columns);
    const initClassName = 'initialize';
    const animateClassName = 'animate';
    const animationDuration = initalizeFlag ? ANIMATION_DURATION + 50 : ANIMATION_DURATION;

    if (initalizeFlag) {
        this.el.classList.add(initClassName);
    } else {
        this.el.classList.remove(initClassName);
    }

    // set position
    this.el.classList.add(animateClassName);
    this.el.setAttribute('data-x', fromLeft);
    this.el.setAttribute('data-y', fromTop);

    return new Promise((resolve) => {
        window.setTimeout(() => {
            resolve();
            self.el.classList.remove(animateClassName);
            self.el.classList.remove(initClassName);
        }, animationDuration);
    });
};

/**
 * Check if tile can be moved in at least one direction
 * @returns {Boolean} if tile has at least one possible move
 */
Tile.prototype.isMoveable = function () {
    // run all checks; return true if any moves are possible
    if (this.move('up', true) || this.move('right', true) || this.move('down', true) || this.move('left', true)) {
        return true;
    } else {
        return false;
    }
};

/**
 * Run tile move logic
 */
Tile.prototype.move = function (getDirection, _checkFlag) {
    const checkFlag = _checkFlag ? true : false;
    const direction = getDirection.toLowerCase();
    const getX = this.x;
    const getY = this.y;
    const nextPositionArray = [];
    let getNext;

    if (direction === 'up') {
        // if UP: check next position
        getNext = this.y > 0 ? this.game.board[this.x][this.y - 1] : false;
        nextPositionArray.push(this.x, this.y - 1);
    } else if (direction === 'right') {
        // if RIGHT: check next position
        getNext = this.x < 3 ? this.game.board[this.x + 1][this.y] : false;
        nextPositionArray.push(this.x + 1, this.y);
    } else if (direction === 'down') {
        // if DOWN: check next position
        getNext = this.y < 3 ? this.game.board[this.x][this.y + 1] : false;
        nextPositionArray.push(this.x, this.y + 1);
    } else if (direction === 'left') {
        // if LEFT: check next position
        getNext = this.x > 0 ? this.game.board[this.x - 1][this.y] : false;
        nextPositionArray.push(this.x - 1, this.y);
    }
    // Check if next position contains match or is empty
    const isNextMatch = getNext && getNext.tilesArray.length === 1 && getNext.tilesArray[0].valueProp === this.valueProp;
    const isNextEmpty = getNext && getNext.tilesArray.length === 0;

    // "check only" mode; only to check if tile can move
    if (checkFlag) {
        return isNextEmpty || isNextMatch ? true : false;
    } else if (isNextEmpty || isNextMatch) {
        // not "check only" mode; will actually run move logic
        this.setPosition(nextPositionArray[0], nextPositionArray[1]);
        this.removeOldPosition(getX, getY);
        // do NOT continue to move if a tile has matched - and therefore MERGED into adjoining tile
        if (!isNextMatch) {
            this.move(direction);
        }
    }
};

/**
 * Initialize game
 */
function gameStart() {
    gameInstance && gameInstance.destroyGame();
    gameInstance = new Game(4);
    gameInstance.initialize();
}
// run initialization when DOM is ready
document.readyState === 'complete' ? gameStart() : window.addEventListener('DOMContentLoaded', gameStart);
