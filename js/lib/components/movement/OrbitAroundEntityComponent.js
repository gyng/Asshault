function OrbitAroundEntityComponent (angularVelocity, radius, targetEntity) {
  this.angularVelocity = angularVelocity;
  this.direction = 0;
  this.targetEntity = targetEntity;
  this.radius = radius;
  this.type = 'movement';
  this.age = 0;
}

OrbitAroundEntityComponent.prototype.tick = function (position) {
  this.age++;
  var rad = Util.deg2rad(this.age % 360) * this.angularVelocity;
  position.x = this.targetEntity.components.position.x - Math.cos(rad) * this.radius;
  position.y = this.targetEntity.components.position.y + Math.sin(rad) * this.radius;
  position.direction = rad;
}