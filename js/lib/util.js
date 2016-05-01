window.Util = {
  twoPi: Math.PI * 2,

  randomFloat: function (low, high) {
    if (typeof high === 'undefined') {
      return low * Math.random();
    }

    var offset = (low < 0) ? -low : low;
    var number = Math.random() * (high + offset);
    return number - offset;
  },

  randomNegation: function (num) {
    return Math.random() > 0.5 ? num : -num;
  },

  randomError: function (value) {
    return value * Math.random() * (Math.random() > 0.5 ? -1 : 1);
  },

  randomRad: function () {
    return Math.random() * 2 * Math.PI;
  },

  randomDeg: function () {
    return Math.random() * 360;
  },

  deg2rad: function (deg) {
    return deg * Math.PI / 180;
  },

  rad2deg: function (rad) {
    return rad * 180 / Math.PI;
  },

  isDefined: function (object) {
    return object !== null && typeof object !== 'undefined';
  },

  clamp: function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  hypotenuse: function (a, b) {
    return Math.sqrt(a * a + b * b);
  },

  // Takes four values x1, y1, x2, y2 or point1, point2
  // Point being { x: 1, y: 1 }
  distanceBetween: function (p1, p2, x2, y2) {
    if (typeof x2 === 'undefined') {
      return this.hypotenuse(p2.x - p1.x, p2.y - p1.y);
    }

    return this.hypotenuse(x2 - p1, y2 - p2);
  },

  nearestPoint: function (list, point) {
    var minDistance = Number.MAX_VALUE;
    var object;
    var d;

    for (var i = 0; i < list.length; i++) {
      d = this.distanceBetween(list[i], point);

      if (d < minDistance) {
        minDistance = d;
        object = list[i];
      }
    }

    return object;
  },

  // Takes vector object v { x: 1, y: 1 } or x, y coordinates as v and y
  normalize: function (v, y) {
    var h;

    if (typeof y !== 'undefined') {
      h = this.hypotenuse(v, y);
      return [v / h, y / h];
    }

    h = this.hypotenuse(v.x, v.y);
    return { x: v.x / h, y: v.y / h };
  },

  sample: function (array) {
    if (array.length && array.length >= 0) {
      return array[~~(Math.random() * array.length)];
    }

    return null;
  },

  jitterPosition: function (position, variance) {
    return {
      x: position.x + this.randomError(variance),
      y: position.y + this.randomError(variance)
    };
  },

  romanize: function (num) {
    if (!+num) return false;

    var digits = String(+num).split('');
    var key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
               '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
               '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    var roman = '';
    var i = 3;

    while (i--) {
      roman = (key[+digits.pop() + (i * 10)] || '') + roman;
    }

    return Array(+digits.join('') + 1).join('M') + roman;
  }
};
