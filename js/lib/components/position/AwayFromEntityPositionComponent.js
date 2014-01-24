function AwayFromEntityPositionComponent (targetEntity, threshold, maxX, maxY) {
  this.x;
  this.y;
  this.direction = 0;
  this.type = 'position';

  this.targetEntity = targetEntity;
  this.threshold = threshold;

  var attempts = 0;
  var maxAttempts = 100;

  do {
    spawn = { x: _.random(maxX), y: _.random(maxY) };
  } while (
    Util.distanceBetween(spawn, targetEntity.components.position) < this.threshold &&
    attempts++ < maxAttempts);

  if (attempts < maxAttempts) {
    this.x = spawn.x;
    this.y = spawn.y;
  } else {
    this.x = 0;
    this.y = 0;
  }
}