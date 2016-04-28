var board

class Game {
  constructor(id) {
    this.canvas = document.getElementById(id)
    this.ctx = this.canvas.getContext( "2d" )
    board = new Board(this.ctx, this.canvas)
    this.listeners = new Listeners(this)
  }

  setup() {
    board.setup()
    this.listeners.setup()
  }

  static update() {
    board.draw()

    window.requestAnimationFrame(Game.update)
  }
}

class Listeners {
  constructor(game) {
    this.game = game
    this.canvas = game.canvas
  }

  setup() {
    this.canvas.addEventListener("mousemove", this.mouseMove)
    this.canvas.addEventListener("click", this.mouseClick)
  }

  mouseMove(e) {
    var rect = this.getBoundingClientRect()
    var info = document.getElementById("hover-info")
    var x = (e.clientX - rect.left)
    var y = (e.clientY - rect.top)
    var msg = x + ", " + y
    var piece = undefined
    for(var row = 0; row < board.rows; row++) {
      for(var col = 0; col < board.columns; col++) {
        var tile = board.tiles[row][col]
        tile.highlight = tile.entered(x,y)
        if(tile.piece !== undefined && tile.piece.clicked) {
          piece = tile.piece
        }
      }
    }
    if(piece !== undefined) {
      piece.x = x
      piece.y = y
    }
    info.innerHTML = msg
  }

  mouseClick(e) {
    var rect = this.getBoundingClientRect()
    var x = (e.clientX - rect.left)
    var y = (e.clientY - rect.top)
    for(var row = 0; row < board.rows; row++) {
      for(var col = 0; col < board.columns; col++) {
        var tile = board.tiles[row][col]
        tile.clicked = tile.clicked ? false : tile.entered(x,y)
        if(tile.piece !== undefined) {
          tile.piece.clicked = tile.clicked
        }
      }
    }
  }
}

class Board {
  constructor(ctx, canvas, rows = 8, columns = 8, tile_size = 75, color1 = "black", color2 = "white") {
    this.ctx = ctx
    this.canvas = canvas
    this.rows = rows
    this.columns = columns
    this.tile_size = tile_size
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

  setup() {
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
          var piece = new Piece(col * this.tile_size + this.tile_size / 2, row * this.tile_size + this.tile_size / 2, color, player)
          this.tiles[row][col].piece = piece
        }
        row = row + row_step
      }
    }
  }

  removePieces() {
    for(var row = 0; row < this.rows; row++) {
      for(var col = 0; col < this.columns; col++) {
        this.tiles[row][col].piece = undefined
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for ( var row = 0; row < this.rows; row++ ) {
      for ( var col = 0; col < this.columns; col++ ) {
        var tile = this.tiles[row][col]
        this.ctx.beginPath()
        this.ctx.rect(tile.x, tile.y, tile.size, tile.size)
        this.ctx.fillStyle = tile.color
        this.ctx.fill()
        if(tile.clicked) {
          this.ctx.lineWidth = 2
          this.ctx.strokeStyle = "blue"
          this.ctx.stroke()
        } else if(tile.highlight) {
          this.ctx.lineWidth = 2
          this.ctx.strokeStyle = "orange"
          this.ctx.stroke()
        }
      }
    }
    for ( var row = 0; row < this.rows; row++ ) {
      for ( var col = 0; col < this.columns; col++ ) {
        var tile = this.tiles[row][col]
        if (tile.piece !== undefined) {
          var piece = tile.piece
          this.ctx.beginPath()
          this.ctx.arc(piece.x, piece.y, tile.size / 2.5, 2 * Math.PI, false)
          this.ctx.fillStyle = piece.color
          this.ctx.fill()
          /*
          this.ctx.lineWidth = 3
          this.ctx.strokeStyle = "black"
          this.ctx.stroke()
          */
        }
      }
    }
  }
}

class Piece {
  constructor(x, y, color, player) {
    this.x = x
    this.y = y
    this.color = color
    this.player = player
    this.clicked = false
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
    this.highlight = false
    this.clicked = false
  }

  entered(x, y) {
    return this.x <= x && this.x + this.size >= x && this.y <= y && this.y + this.size >= y
  }
}
