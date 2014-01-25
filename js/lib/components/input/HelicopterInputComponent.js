function HelicopterInputComponent (position, movement) {
  this.type = 'input';

  keypress.combo("w", function() { movement.accelerate(position,  1, 'y'); });
  keypress.combo("s", function() { movement.accelerate(position, -1, 'y'); });
  keypress.combo("a", function() { movement.accelerate(position,  1, 'x'); });
  keypress.combo("d", function() { movement.accelerate(position, -1, 'x'); });
}