function randomFloat (low, high) {
  if (typeof high === 'undefined') {
    return low * Math.random();
  } else {
    var offset = (low < 0) ? -low : -low;
    var number = Math.random() * (high + offset);
    return number - offset;
  }
}

function randomNegation (num) {
  return Math.random() > 0.5 ? num : -num;
}

function randomError(positiveValue) {
 return positiveValue * Math.random() * (Math.random() > 0.5 ? -1 : 1);
}

function deg2rad (deg) {
  return deg * Math.PI / 180;
}

function rad2deg (rad) {
  return rad * 180 / Math.PI;
}

function isDefined (object) {
  return object !== null && typeof object !== 'undefined';
}

function hypotenuse(a, b) {
  return Math.sqrt(a * a + b * b);
}

// Takes vector object v or x(v)-y coordinates
function normalize(v, y) {
  var h;

  if (typeof y !== 'undefined') {
    h = hypotenuse(v, y);
    return [v / h, y / h];
  } else {
    h = hypotenuse(v.x, v.y);
    return { x: v.x / h, y: v.y / h };
  }
}

// Use underscore.js's implementation _.sample(a, *n)
// function sample (array) {
//   if (array.length && array.length >= 0)
//     return array[~~(Math.random() * array.length)];
//   else
//     return null;
// }