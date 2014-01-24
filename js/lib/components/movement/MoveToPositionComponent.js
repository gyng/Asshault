function MoveToPositionComponent (speed, x, y) {
  this.speed = speed;
  this.direction = 0;
  this.targetX = x;
  this.targetY = y;
  this.type = 'movement';
}

MoveToPositionComponent.prototype.tick = function (position) {
  this.direction = Math.atan2(this.targetY - position.y, this.targetX - position.x);
  position.x += Math.cos(this.direction) * this.speed;
  position.y += Math.sin(this.direction) * this.speed;
}