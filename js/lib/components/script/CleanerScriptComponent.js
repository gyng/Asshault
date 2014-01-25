// Actually Cleaner script
function CleanerScriptComponent (parent) {
  this.parent = parent;
  this.type = 'script';
  this.targetAge = 0;
  this.aoe = 75;
}

CleanerScriptComponent.prototype.tick = function () {
  var components = this.parent.components;

  this.targetAge++;

  if (!Util.isDefined(components.target)) {
    this.parent.addComponent(this.randomTarget());
  } else if (Util.isDefined(components.target) && Util.isDefined(components.position)) {
    var target   = components.target;
    var position = components.position;

    components.movement.direction = Math.atan2(target.y - position.y, target.x - position.x);
    components.movement.update();

    if (Util.hypotenuse(target.x - position.x, target.y - position.y) < 20) {
      this.parent.game.audio.play(this.parent.sounds.target, 0.7);
      this.parent.xp += Math.floor(this.targetAge / 50);
      this.parent.addComponent(this.randomTarget());
      this.targetAge = 0;
      this.parent.updateInfo();
    }

    // Actual cleaning TODO: Move into separate script
    if (this.parent.age % 60 === 0) {
      var prevOp = this.parent.game.renderer.decalContext.globalCompositeOperation;
      this.parent.game.renderer.decalContext.globalCompositeOperation = 'destination-out';
      this.parent.game.renderer.decalContext.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.parent.game.renderer.decalContext.beginPath();
      this.parent.game.renderer.decalContext.arc(position.x, position.y, this.aoe, 0, 2 * Math.PI);
      this.parent.game.renderer.decalContext.fill();
      this.parent.game.renderer.decalContext.globalCompositeOperation = prevOp;
    }
  }
}

CleanerScriptComponent.prototype.randomTarget = function () {
  return new PositionalTargetComponent(
    _.random(this.parent.game.canvas.width),
    _.random(this.parent.game.canvas.height)
  );
}