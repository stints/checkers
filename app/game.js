var board

class Game {
  constructor(id) {
    this.canvas = document.getElementById(id)
    this.ctx = this.canvas.getContext( "2d" )
    board = new Board(this.ctx, this.canvas)
  }

  setup() {
    board.initPieces()
  }

  static update() {
    board.draw()
  }
}

class Board {
  constructor(ctx, canvas, rows = 8, columns = 8, tile_size = 75, color1 = "black", color2 = "white") {
    this.ctx = ctx
    this.canvas = canvas
    this.rows = rows
    this.columns = columns
    this.tiles = new Array(rows)
    for( var row = 0; row < rows; row++ ) {
      this.tiles[row] = new Array(columns)
      for( var col = 0; col < columns; col++ ) {
        var x = col * tile_size
        var y = row * tile_size
        var color = row % 2 == 0 ? col % 2 == 0 ? color1 : color2 : col % 2 != 0 ?  color1 : color2
        this.tiles[row][col] = new Tile(x, y, row, col, color, tile_size)
      }
    }
  }

  initPieces() {
    this.removePieces()
    for(var player = 0; player < 2; player++) {
      var row = 0
      var row_step = 1
      var end_row = 3
      var color = "red"

      if(player == 1) {
        row = 7
        row_step = -1
        end_row = 4
        color = "yellow"
      }

      while(row != end_row) {
        for(var n = 0; n < this.columns / 2; n++) {
          var col = n * 2
          if(row % 2 != 0) {
            col++
          }
          var piece = new Piece(row, col, color, player)
          this.tiles[col][row].piece = piece
        }
        row = row + row_step
      }
    }
  }

  removePieces() {
    for(var col = 0; col < this.columns; col++) {
      for(var row = 0; row < this.columns; row++) {
        this.tiles[col][row].piece = undefined
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for ( var col = 0; col < this.columns; col++ ) {
      for ( var row = 0; row < this.rows; row++ ) {
        var tile = this.tiles[col][row]
        this.ctx.beginPath()
        this.ctx.rect(tile.x, tile.y, tile.size, tile.size)
        this.ctx.fillStyle = tile.color
        this.ctx.fill()

        if (tile.piece !== undefined) {
          var piece = tile.piece
          this.ctx.beginPath()
          this.ctx.arc(piece.row * tile.size + tile.size / 2, piece.col * tile.size + tile.size / 2, tile.size / 2.5, 2 * Math.PI, false)
          this.ctx.fillStyle = piece.color
          this.ctx.fill()
          this.ctx.lineWidth = 3
          this.ctx.strokeStyle = "black"
          this.ctx.stroke()
        }
      }
    }
  }
}

class Piece {
  constructor(row, col, color, player) {
    this.row = row
    this.col = col
    this.color = color
    this.player = player
  }
}

class Tile {
  constructor(x, y, row, col, color, size) {
    this.x = x
    this.y = y
    this.row = row
    this.col = col
    this.color = color
    this.size = size

    this.piece = undefined
  }
}
