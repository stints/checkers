class Player {
  constructor(name) {
    this._name = name;
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
    this._players[0] = new Player("player one");
    this._players[1] = new Player("player two");
    this._currentPlayer = this._players[0];

    // Create pieces and add to player
    for(var i = 0; i < this._players.length; i++) {
      var player = this._players[i];
      for(var j = 0; j < 12; j++) {
        var piece = new Piece(player, (i+1)-(i*3));
        piece.image = i == 0 ? "res/redpiece.png" : "res/whitepiece.png";
        piece.imageKing = i == 0 ? "res/redpiece_king.png" : "res/whitepiece_king.png";
        this._pieces.push(piece);
        player.addPiece(piece);
      }
    }

    // Create board tiles
    for(var row = 0; row < 8; row++) {
      this._board[row] = new Array(8);
      for(var col = 0; col < 8; col++) {
        var img = (row + col) % 2 ? "res/darkwoodtile.png" : "res/lightwoodtile.png"
        var tile = new Tile(row, col, img)
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
            this._availableMoves = this.jumpPath(tile);
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
            } else if(containsNode(this._availableMoves, tile)) {
              this._moveSpot = tile;
            }
          }
        }
      }
    }
  }

  // returns an array of tiles that the selected piece can jump
  // the starting node is always the current tile
  // by default, do not add the node into the paths
  jumpPath(tile, lastNode = null, direction = null, fromJump = false) {
    var paths = []
    var node = new Node(tile);
    if(lastNode != null) {
      node.prev = lastNode;
    }
    if(fromJump) {
      node._jumped = lastNode._tile.piece;
    }
    if(direction == null && !fromJump) {
      var nextMoves = tile.legalMoves(this._movePiece);
      for(var i = 0; i < nextMoves.length; i++) {
        var row = nextMoves[i][0];
        var col = nextMoves[i][1];
        var nextTile = this._board[row][col];
        // Is there a piece in this tile that does not belong to the current player?
        if(nextTile.hasPiece() && !nextTile.piece.isSamePlayer(this._currentPlayer)) {
          var nextPaths = this.jumpPath(nextTile, node, nextTile.direction(tile)); // can we continue
          if(nextPaths.length) {
            paths = paths.concat(nextPaths);
          }
        } else if(nextTile.hasPiece() && nextTile.piece.isSamePlayer(this._currentPlayer)) {
          // do nothing
        } else {
          var nextNode = new Node(nextTile);
          nextNode.prev = node;
          paths.push(nextNode);
        }
      }
    } else { // We're in the process of a jump
      if(direction != null) {
        var row = tile._row + direction[0];
        var col = tile._col + direction[1];
        if(row >= 0 && row <= 7 && col >= 0 && col <= 7) {
          var nextTile = this._board[row][col];
          if(!nextTile.hasPiece()) { // we can make a jump!
            //paths.push(node);
            var nextPaths = this.jumpPath(nextTile, node, null, true);
            if(nextPaths.length) {
              paths = paths.concat(nextPaths);
            }
          }
        }
      } else { // we're from a previous successful jump and can only continue jumps
        // multijump
        paths.push(node);
      }
    }
    return paths;
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
        var highlight = containsNode(this._availableMoves, this._board[row][col]);
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

// A node is a single tile a selected piece can jump to, any number in an array creates a path
class Node {
  constructor(tile) {
    this._tile = tile;
    this._prevNode = null;
    this._jumped = null;
  }

  set prev(node) {
    this._prevNode = node;
  }

  jumped(piece) {
    this._jumped = piece;
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
    this._img = new Image();
    this._imgKing = new Image();
  }

  isSamePlayer(player) {
    return player === this._player;
  }

  set image(imgSrc) {
    this._img.src = imgSrc;
  }

  set imageKing(imgSrc) {
    this._imgKing.src = imgSrc;
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

  draw(ctx) {
    var x = this._col * this._tile.width;
    var y = this._row * this._tile.height;
    if(!this._king) {
      ctx.drawImage(this._img, 0, 0, 75, 75, x, y, 75, 75)
    } else {
      ctx.drawImage(this._imgKing, 0, 0, 75, 75, x, y, 75, 75)
    }
  }
}

class Tile {
  constructor(row, col, imgSrc) {
    this._row = row;
    this._col = col;
    this._piece = null;
    this._width = 75;
    this._height = 75;
    this._img = new Image()
    this._img.src = imgSrc;
  }

  // A guess at legal moves allowed, does not take into account other pieces
  legalMoves(piece) {
    var moves = [];
    var moveRow = this._row + piece._rowDirection;
    if((piece._rowDirection == 1 && moveRow <= 7) || (piece._rowDirection == -1 && moveRow >= 0)) {
      if(this._col + 1 <= 7) {
        moves.push([moveRow, this._col + 1]);
      }
      if(this._col - 1 >= 0) {
        moves.push([moveRow, this._col - 1]);
      }
    }

    if(piece._king) {
      moveRow = this._row + (-1 * piece._rowDirection);
      if(this._col + 1 <= 7) {
        moves.push([moveRow, this._col + 1]);
      }
      if(this._col - 1 >= 0) {
        moves.push([moveRow, this._col - 1]);
      }
    }
    return moves;
  }

  hasPiece() {
    return this._piece != null;
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
    ctx.drawImage(this._img, 0, 0, this._width, this._height, x, y, this._width, this._height);
    if(highlight) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
      ctx.fillRect(x, y, this._width, this._height);
      ctx.closePath();
    }
  }

  intersect(x, y) {
    return (this._row * this._height) < y
        && (this._row * this._height + this._height) > y
        && (this._col * this._width) < x
        && (this._col * this._width + this._width) > x
  }

  // find the direction from the tile argument
  // eg - this 1,1 and tile 2,0
  //      direction +1, -1
  direction(tile) {
    var direction = new Array(2);
    direction[0] = this._row - tile._row > 0 ? 1 : -1;
    direction[1] = this._col - tile._col > 0 ? 1 : -1;
    return direction;
  }
}

// Find if object in Array
function containsNode(array, obj) {
  for(var i = 0; i < array.length; i++) {
    if(array[i]._tile === obj) {
      return true;
    }
  }
  return false;
}
