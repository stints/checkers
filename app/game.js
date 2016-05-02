class Player {
  constructor(name, color) {
    this._name = name;
    this._color = color;
    this._pieces = [];
  }

  addPiece(piece) {
    this._pieces.push(piece);
  }

  get pieces() {
    return this._pieces
  }

  get pieceColor() {
    return this._color;
  }
}

class Game {
  constructor(id) {
    this._canvas = document.getElementById(id);
    this._ctx = this._canvas.getContext("2d");
    this._players = new Array(2);
    this._pieces = [];
    this._board = new Array(8);


    this._currentPlayer = null
    this._movePiece = null // The piece to move
    this._availableMoves = [] // Tiles the movePiece can jump to
    this._moveSpot = null // The tile to move to
  }

  setup() {
    // Create players
    this._players[0] = new Player("player one", "red");
    this._players[1] = new Player("player two", "white");
    this._currentPlayer = this._players[0];

    // Create pieces and add to player
    for(var i = 0; i < this._players.length; i++) {
      var player = this._players[i];
      for(var j = 0; j < 12; j++) {
        var piece = new Piece(player, (i+1)-(i*3));
        this._pieces.push(piece);
        player.addPiece(piece);
      }
    }

    // Create board tiles
    for(var row = 0; row < 8; row++) {
      this._board[row] = new Array(8);
      for(var col = 0; col < 8; col++) {
        var color = (row + col) % 2 ? "yellow" : "green"
        var tile = new Tile(row, col, color)
        this._board[row][col] = tile
      }
    }

    // Add player one pieces to board
    var row = 0, col = 0;
    for(var p = 1; p <= 12; p++) {
      var piece = this._players[0].pieces[p - 1];
      var tile = this._board[row][col];
      piece.setPosition(tile);
      tile.piece = piece;
      col += 2;
      if(p % 4 == 0) {
        row++;
        col = row % 2 == 0 ? 0 : 1;
      }
    }


    // Add player two pieces to board
    row = 5, col = 1;
    for(var p = 1; p <= 12; p++) {
      var piece = this._players[1].pieces[p - 1];
      var tile = this._board[row][col];
      piece.setPosition(tile);
      tile.piece = piece;
      col += 2;
      if(p % 4 == 0) {
        row++;
        col = row % 2 == 0 ? 0 : 1;
      }
    }

    // Add event handlers
    // Click handler
    this._canvas.addEventListener("click", e => this.handleClick(e));
    // Hover handler
    this._canvas.addEventListener("mousemove", e => this.handleHover(e));
  }

  handleClick(e) {
    var rect = this._canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left);
    var y = (e.clientY - rect.top);

    // Find clicked tile
    for(var row = 0; row < 8; row++) {
      for(var col = 0; col < 8; col++) {
        // Is this click the moving piece?
        if(this._movePiece == null) {
          // Find the tile this click intersects and if it's the current players piece
          if(this._board[row][col].intersect(x,y) && this._board[row][col].piece !== null && this._board[row][col].piece.player === this._currentPlayer) {
            var tile = this._board[row][col];
            var piece = tile.piece;
            this._movePiece = piece;
            piece.selected = true;
            this._availableMoves = this.findLegalJumps(piece.legalMoves());
          }
        } else {
          // Where should we move the move piece?
          if(this._board[row][col].intersect(x,y)) {
            var tile = this._board[row][col];
            var piece = tile.piece;
            // Did we click on the move piece again, if so, unselect it.
            if(this._movePiece === piece) {
              this._movePiece = null;
              piece.selected = false;
              this._availableMoves = false;
            } else if(contains(this._availableMoves, tile)) {
              this._moveSpot = tile;
            }
          }
        }
      }
    }
  }

  // returns an array of tiles that the selected piece can jump
  // first given a list of legal moves given by the piece
  findLegalJumps(moves) {
    var tiles = [];
    var row = 0;
    var col = 0;
    for(var i = 0; i < moves.length; i++) {
      row = moves[i][0];
      col = moves[i][1];
      var tile = this._board[row][col];
      tiles.push(tile);
    }

    return tiles;
  }

  handleHover(e) {
    var info = document.getElementById("hover-info");
    var rect = this._canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left);
    var y = (e.clientY - rect.top);
    var msg = x + ", " + y;
    info.innerHTML = msg;
  }

  nextPlayer() {
    this._movePiece = null;
    this._moveSpot = null;
    this._availableMoves = [];
    this._currentPlayer = this._currentPlayer == this._players[1] ? this._players[0] : this._players[1];
  }

  start() {
    window.requestAnimationFrame(() => this.update());
  }

  update() {
    this.draw();
    if(this._movePiece != null && this._moveSpot != null) {
      var row = this._movePiece._row;
      var col = this._movePiece._col;
      this._board[row][col].piece = null;
      this._moveSpot.piece = this._movePiece;
      this._movePiece.setPosition(this._moveSpot)
      this.nextPlayer();
    }
    window.requestAnimationFrame(() => this.update());
  }

  draw() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    // draw board
    for(var row = 0; row < 8; row++) {
      for(var col = 0; col < 8; col++) {
        var highlight = contains(this._availableMoves, this._board[row][col]);
        this._board[row][col].draw(this._ctx, highlight);
      }
    }
    // draw pieces, only if still in game
    for(var p = 0; p < this._pieces.length; p++) {
      var piece = this._pieces[p]
      if(piece.inPlay) {
        piece.draw(this._ctx);
      }
    }
  }
}

class Piece {
  constructor(player, direction) {
    this._row = -1;
    this._col = -1;
    this._inPlay = true;
    this._player = player;
    this._isKing = false;
    this._tile = null
    this._move = 1;
    this._rowDirection = direction;
    this._selected = false;
  }

  set selected(select) {
    this._selected = select;
  }

  get player() {
    return this._player;
  }

  setPosition(tile) {
    this._row = tile._row;
    this._col = tile._col;
    this._tile = tile
  }

  get inPlay() {
    return this._inPlay;
  }

  jumped() {
    this._inPlay = false;
    this._row = -1;
    this._col = -1;
    this._tile.piece = null;
  }

  // A guess at legal moves allowed, does not take into account other pieces
  legalMoves() {
    var moves = [];
    var moveRow = this._row + this._rowDirection;
    if((this._rowDirection == 1 && moveRow <= 7) || (this._rowDirection == -1 && moveRow >= 0)) {
      if(this._col + 1 <= 7) {
        moves.push([moveRow, this._col + 1]);
      }
      if(this._col - 1 >= 0) {
        moves.push([moveRow, this._col - 1]);
      }
    }

    if(this._king) {
      moveRow = this._row + (-1 * this._rowDirection);
      if(this._col + 1 <= 7) {
        moves.push([moveRow, this._col + 1]);
      }
      if(this._col - 1 >= 0) {
        moves.push([moveRow, this._col - 1]);
      }
    }
    return moves;
  }

  draw(ctx) {
    var x = this._col * this._tile.width + this._tile.width / 2;
    var y = this._row * this._tile.height + this._tile.width / 2;
    ctx.beginPath();
    ctx.arc(x, y, 25, 2 * Math.PI, false);
    ctx.fillStyle = this._player.pieceColor;
    ctx.fill();
  }
}

class Tile {
  constructor(row, col, color) {
    this._row = row;
    this._col = col;
    this._color = color;
    this._piece = null;
    this._width = 75;
    this._height = 75;
  }

  get piece() {
    return this._piece;
  }

  set piece(piece) {
    this._piece = piece;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  draw(ctx, highlight) {
    var x = this._col * this._width;
    var y = this._row * this._height;
    ctx.beginPath();
    ctx.rect(x, y, this._width, this._height);
    ctx.fillStyle = this._color;
    ctx.fill();
    if(!highlight) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.stroke();
    } else {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "blue";
      ctx.stroke();
    }
  }

  intersect(x, y) {
    return (this._row * this._height) < y
        && (this._row * this._height + this._height) > y
        && (this._col * this._width) < x
        && (this._col * this._width + this._width) > x
  }
}

// Find if object in Array
function contains(array, obj) {
  for(var i = 0; i < array.length; i++) {
    if(array[i] === obj) {
      return true;
    }
  }
  return false;
}
