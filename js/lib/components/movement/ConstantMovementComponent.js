function ConstantMovementComponent (speed, direction) {
  this.speed = speed;
  this.direction = direction;
  this.type = 'movement';
}

ConstantMovementComponent.prototype.initialize = function () {
  this.update();
}

ConstantMovementComponent.prototype.tick = function (position) {
  position.x += this.deltaX;
  position.y += this.deltaY;
};

ConstantMovementComponent.prototype.update = function () {
  this.deltaX = Math.cos(this.direction) * this.speed;
  this.deltaY = Math.sin(this.direction) * this.speed;
}