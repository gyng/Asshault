function Player(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.health = 10;

  // keypress.combo("z", function () {
  //   this.fire(Math.PI);
  // }.bind(this));

  $('#canvas').mousedown(function (e) {
    this.firing = true;
  }.bind(this));

  $('#canvas').mouseup(function (e) {
    this.firing = false;
  }.bind(this));
}
Player.prototype = new Entity();
Player.prototype.constructor = Player;
Player.prototype.step = function () {
  // this.rotation += 0.1;
  this.rotation = Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x);
  this.age += 1;
  if (this.firing) {
    this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x));
  }
};
Player.prototype.getImage = function () {
  return this.sprites.debug;
};
Player.prototype.fire = function (radians, directionalOffset) {
  directionalOffset = directionalOffset * Math.PI / 180 || 0;
  var variance = 4 * Math.random() * (Math.random() > 0.5 ? 1 : -1) * Math.PI / 180 + directionalOffset;
  // Firing rate
  if (this.age % 4 === 0) {
    this.game.entities.push(
      new Bullet(this.x, this.y, this.resources, radians + variance, 1, 30)
    );
    this.fireShake();
  }
};
Player.prototype.fireShake = function () {
  var offsetDistance = 5;
  var shakeDistance = 7;
  var shakeX = this.x - this.game.mouse.x;
  var shakeY = this.y - this.game.mouse.y;
  var hyp = Math.sqrt(Math.pow(shakeX, 2) + Math.pow(shakeY, 2));
  this.game.shake.x += shakeX / hyp * shakeDistance;
  this.game.shake.y += shakeY / hyp * shakeDistance;
  this.drawOffset.x += shakeX / hyp * offsetDistance;
  this.drawOffset.y += shakeY / hyp * offsetDistance;
};
Player.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 15);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 15);

  if (this.firing && this.age % 4 <= 2)
    context.drawImage(this.sprites.flash1, -this.width * 2, -this.height);
  if (this.firing && this.age % 8 <= 3)
    context.drawImage(this.sprites.flash2, -this.width * 2, -this.height);
};