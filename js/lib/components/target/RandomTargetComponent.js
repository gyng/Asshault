function RandomTargetComponent (game) {
  this.game = game;
  this.age = 0;
  this.targetAge = 0;
  this.target;
  this.type = 'target';
}

RandomTargetComponent.prototype.tick = function () {
  this.age++;
  this.targetAge++;
  if ((!Util.isDefined(this.target) || this.target.markedForDeletion) && this.age % 10 === 0) {
    this.target = _.sample(this.game.enemies);
    this.targetAge = 0;
  }
}

RandomTargetComponent.prototype.isDead = function () {
  if (Util.isDefined(this.target) && this.target.markedForDeletion) {
    this.target = null;
  }
}