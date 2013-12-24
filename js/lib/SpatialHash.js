// Slightly modified from http://entitycrisis.blogspot.com/2011/07/spatial-hash-in-javascript-for-2d.html
function SpatialHash (cellSize) {
  this.cellSize = cellSize;
  this.idx = [];
}

SpatialHash.prototype = {
  add: function (x, y, object) {
    var cell = [];
    var keys = this.keys(x, y);

    // Add to self and neighbouring cells
    for (var i in keys) {
      var key = keys[i];

      if (key in this.idx) {
        cell = this.idx[key];
      } else {
        this.idx[key] = cell;
      }

      if (cell.indexOf(object) === -1) {
        cell.push(object);
      }
    }
  },

  query: function (x, y) {
    var key = this.key(x, y);
    return (typeof this.idx[key] === 'undefined') ? [] : this.idx[key];
  },

  // Get own and neighbouring cells
  keys: function (x, y) {
    var d = this.cellSize / 2;
    return [
      this.key(x-d, y-d),
      this.key(x,   y-d),
      this.key(x+d, y-d),

      this.key(x-d, y),
      this.key(x,   y),
      this.key(x+d, y),

      this.key(x-d, y+d),
      this.key(x,   y+d),
      this.key(x+d, y+d)
    ];
  },

  key: function (x, y) {
    x = Math.floor(x / this.cellSize) * this.cellSize;
    y = Math.floor(y / this.cellSize) * this.cellSize;
    return x + ':' + y;
  }
};