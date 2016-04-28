var TILES_X = 8
var TILES_Y = 8
var TILE_SIZE = 75

var BOARD = new Array(TILES_X)

function gameInit() {
  var canvas = document.getElementById( "board" )
  var ctx = canvas.getContext( "2d" )
  createBoard()
  drawBoard( ctx )
}

function createBoard() {
  for ( var i = 0; i < TILES_X; i++ ) {
    BOARD[i] = new Array(TILES_Y)
    for ( var j = 0; j < TILES_Y; j++ ) {
      var x = i * TILE_SIZE
      var y = j * TILE_SIZE
      var color = i % 2 == 0 ? j % 2 == 0 ? "black" : "white" : j % 2 != 0 ?  "black" : "white"
      BOARD[i][j] = new Tile(x, y, color)
    }
  }
}

function drawBoard( ctx ) {
  for ( var i = 0; i < TILES_X; i++ ) {
    for ( var j = 0; j < TILES_Y; j++ ) {
      ctx.beginPath()
      ctx.rect(BOARD[i][j].x, BOARD[i][j].y, TILE_SIZE, TILE_SIZE)
      ctx.fillStyle = BOARD[i][j].color
      ctx.fill()
    }
  }
}

class Piece {
  constructor( color ) {
    this.x = 0
    this.y = 0
    this.color = color
  }
}

class Tile {
  constructor( x, y, color ) {
    this.x = x
    this.y = y
    this.color = color
    this.piece = undefined
  }
}
