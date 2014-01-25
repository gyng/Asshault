function GunnerScriptComponent (ent) {
  this.ent = ent;
  this.type = 'script';
}

GunnerScriptComponent.prototype.tick = function () {
  var components = this.ent.components;

  if (ScriptUtil.hasValidTarget(components.target)) {
    this.ent.fireAt(components.target.target.components.position);

    if (components.target.targetAge === 0) {
      this.ent.addComponent(new FollowEntityMovementComponent(10, components.target.target));
    }

    if (components.target.targetAge === 10) {
      components.movement.speed = 0;
    }

    ScriptUtil.faceTarget(components.position, components.target);
  }
};