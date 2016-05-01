// Slightly modified from http://entitycrisis.blogspot.com/2011/07/spatial-hash-in-javascript-for-2d.html
function SpatialHash(cellSize) {
  this.cellSize = cellSize;
  this.idx = [];
}

SpatialHash.prototype = {
  add: function (x, y, object) {
    var cell = [];
    var key = this.key(x, y);

    if (typeof this.idx.key !== 'undefined') {
      cell = this.idx[key];
    } else {
      this.idx[key] = cell;
    }

    if (cell.indexOf(object) === -1) {
      cell.push(object);
    }
  },

  query: function (x, y, pxRadius) {
    pxRadiux = pxRadius || this.cellSize;
    var keys = this.keys(x, y, pxRadius);
    var results = [];

    for (var i = 0; i < keys.length; i++) {
      if (typeof this.idx[keys[i]] !== 'undefined') {
        results.push(this.idx[keys[i]]);
      }
    }

    return [].concat.apply([], results); // flatten results array
  },

  // Obtain keys for cells in a radius (default 1 cell around)  cell at x, y position
  keys: function (x, y, pxRadius) {
    var results = [];
    var depth = Math.ceil(pxRadiux / this.cellSize);

    for (var i = -depth; i <= depth; i++) {
      for (var j = -depth; j <= depth; j++) {
        results.push(this.key(x + i * this.cellSize, y + j * this.cellSize));
      }
    }

    return results;
  },

  key: function (x, y) {
    x = Math.floor(x / this.cellSize) * this.cellSize;
    y = Math.floor(y / this.cellSize) * this.cellSize;
    return x + ':' + y;
  }
};
