function BulletPing (resources, overrides) {
  Entity.call(this, resources, overrides);

  this.width     = 48 + _.random(64);
  this.height    = 48 + _.random(64);
  this.lifespan  = 13 + _.random(4);
  this.todScale  = 0;
  this.rotation += Util.deg2rad(Util.randomNegation(_.random(50)));

  this.sounds = {
    spawn: ['hit_hurt', 'hit_hurt2', 'hit_hurt3', 'hit_hurt4', 'hit_hurt5', 'hit_hurt6']
  };
  this.game.audio.play(this.sounds.spawn, 0.8);

  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new RenderSpriteComponent(this.sprites.bulletping1, this.x, this.y, this.direction || 0, 1, this.width, this.height, 0, 0));
}

BulletPing.prototype = new Entity();

BulletPing.prototype.constructor = BulletPing;

BulletPing.prototype.tick = function () {
  if (this.age > this.lifespan) {
    this.die();
  }
};