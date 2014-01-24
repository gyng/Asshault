function MovementComponent (speed, direction) {
  this.speed = speed;
  this.direction = direction;
  this.type = 'movement';
}

MovementComponent.prototype.tick = function (position) {
  position.x += Math.cos(this.direction) * this.speed;
  position.y += Math.sin(this.direction) * this.speed;
};