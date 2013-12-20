function Enemy(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 32;
  this.health = 5;
  this.speed = 5;

  this.applyOverrides();

  this.hasShadow = true;
}

Enemy.prototype = new Entity();

Enemy.prototype.constructor = Enemy;

Enemy.prototype.tick = function () {
  this.game.friendlies.forEach(function (ent) {
    if (ent.constructor === Player && ent !== this && this.collidesWith(ent)) {
      this.markedForDeletion = true;
      this.game.entities.push(new Explosion(this.resources, { x: this.x, y: this.y }));
      ent.health -= 1;
    }
  }.bind(this));

  if (this.health <= 0) {
    this.markedForDeletion = true;
    this.game.entities.push(new Explosion(this.resources, { x: this.x, y: this.y }));

    this.game.drawDecal(this.sprites.bloodstain, this.x-this.width/2, this.y-this.height/2, randomRad(), 64 + _.random(32), 64 + _.random(32));
    // var spray = this.sprites.bloodspray;
    this.game.drawDecal(this.sprites.bloodspray, this.x, this.y, this.rotation, 52 + _.random(16), 128 + _.random(386), true);
  }

  // var normShadowOffset = normalize({ x: this.x - this.game.player.x, y: this.y - this.game.player.y });
  // var shadowDistance = 10;
  // this.shadowBlur = 20;
  // this.shadowOffset = { x: normShadowOffset.x * shadowDistance, y: normShadowOffset.y * shadowDistance };

  this.lookAt(this.game.player);

  this.moveTo(this.game.player.x, this.game.player.y, this.speed, this.health / 10);
};

Enemy.prototype.getImage = function () {
  return this.sprites.debug2;
};