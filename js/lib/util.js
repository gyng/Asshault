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

function randomRad() {
  return Math.random() * 2 * Math.PI;
}

function randomDeg() {
  return Math.random() * 360;
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Takes four values x1, y1, x2, y2 or point1, point2
// Point being { x: 1, y: 1 }
function distanceBetween(p1, p2, x2, y2) {
  if (typeof x2 === 'undefined') {
    return hypotenuse(p2.x - p1.x, p2.y - p1.y);
  } else {
    return hypotenuse(x2 - p1, y2 - p2);
  }
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