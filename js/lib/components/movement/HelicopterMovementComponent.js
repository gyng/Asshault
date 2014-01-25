function HelicopterMovementComponent (audio) {
  this.type = 'movement';
  this.speed = 5;
  this.direction = 0;
  this.audio = audio;

  this.heloXSpeed = 0;
  this.heloYSpeed = 0;
  this.heloXAcceleration = 0;
  this.heloYAcceleration = 0;
  this.acceleration = 0;
  this.accelerationRate = 0.25;
  this.maxAcceleration = 0.5;
  this.minAcceleration = -0.5;
  this.maxSpeed = 5;
  this.friction = 0.985;

  this.age = 0;
}

HelicopterMovementComponent.prototype.tick = function (position) {
  this.age++;
  position.x += this.heloXSpeed;
  position.y += this.heloYSpeed;

  this.heloXSpeed *= this.friction;
  this.heloYSpeed *= this.friction;
  this.heloXAcceleration *= this.friction - 0.025;
  this.heloYAcceleration *= this.friction - 0.025;

  if (Util.hypotenuse(this.heloXSpeed, this.heloYSpeed) > 1 &&
    this.age % 60 === 0) {
    this.audio.play('helicopter1', 0.2);
  }
}

HelicopterMovementComponent.prototype.accelerate = function (position, scaling, axis) {
  var closeToEW, closeToNS;
  var deg = Util.rad2deg(position.direction);

  if (axis === 'x') {
    deg = deg - 90;
  }

  if (deg < -180) {
    deg = deg + 360;
  }

  closeToNS = Math.abs((90 - Math.abs(deg)) / 90);
  closeToEW = 1 - closeToNS;

  var yFlip = 1;
  var xFlip = 1;

  if (deg >= -180 && deg <= -90) {
    xFlip = -1;
  } else if (deg > -90 && deg <= 0) {
    xFlip = -1;
    yFlip = -1;
  } else if (deg > 0 && deg < 90) {
    yFlip = -1;
  }

  this.heloXAcceleration += this.accelerationRate * scaling * closeToEW * xFlip;
  this.heloYAcceleration += this.accelerationRate * scaling * closeToNS * yFlip;

  this.heloXAcceleration = Util.clamp(this.heloXAcceleration, this.minAcceleration, this.maxAcceleration);
  this.heloYAcceleration = Util.clamp(this.heloYAcceleration, this.minAcceleration, this.maxAcceleration);

  this.heloXSpeed = Util.clamp(this.heloXSpeed + this.heloXAcceleration, -this.maxSpeed, this.maxSpeed);
  this.heloYSpeed = Util.clamp(this.heloYSpeed + this.heloYAcceleration, -this.maxSpeed, this.maxSpeed);
}