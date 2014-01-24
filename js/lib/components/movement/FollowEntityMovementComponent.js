function FollowEntityMovementComponent (speed, followEntity) {
  this.speed = speed;
  this.direction = 0;
  this.followEntity = followEntity;
  this.type = 'movement';
}

FollowEntityMovementComponent.prototype.tick = function (position) {
  var followEntityPosition = this.followEntity.components.position;
  this.direction = Math.atan2(followEntityPosition.y - position.y, followEntityPosition.x - position.x);
  position.x += Math.cos(this.direction) * this.speed;
  position.y += Math.sin(this.direction) * this.speed;
}