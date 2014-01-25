function Explosion (resources, overrides) {
  Entity.call(this, resources, overrides);

  scale = 1;
  this.width  = 128 + 128 * Math.random() * scale;
  this.height = 128 + 128 * Math.random() * scale;
  this.game.renderer.shake.x += Util.randomNegation(this.width / 6);
  this.game.renderer.shake.y += Util.randomNegation(this.height / 6);

  this.shadowOpacity = 0.7;
  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new RenderShadowComponent
    (120 + _.random(40),
    120,
    "rgba(255, 244, 91," + Math.random() * this.shadowOpacity + ")",
    'circle',
    1,
    false
  ));

  this.sounds = {
    spawn: ['explosion', 'explosion2', 'explosion3', 'explosion4', 'explosion5']
  };
  this.game.audio.play(this.sounds.spawn, 0.8);
}

Explosion.prototype = new Entity();

Explosion.prototype.constructor = Explosion;

Explosion.prototype.tick = function () {
  var shadow = this.components.renderShadow;
  shadow.scale *= 1.07;
  this.shadowOpacity *= 0.80;
  shadow.color = "rgba(255, 244, 91," + Math.random() * this.shadowOpacity + ")";

  this.width  /= 1.05;
  this.height /= 1.05;

  if (this.age > 18) {
    this.markedForDeletion = true;
  }
};

Explosion.prototype.getImage = function () {
  if (this.age <= 5) {
    return this.sprites.flash1;
  } else if (this.age <= 10) {
    return this.sprites.flash2;
  } else if (this.age <= 15) {
    return this.sprites.explosion1;
  } else {
    return this.sprites.explosion2;
  }
};