function SniperScriptComponent (ent) {
  this.ent = ent;
  this.type = 'script';
}

SniperScriptComponent.prototype.tick = function () {
  var components = this.ent.components;
  var ent = this.ent;

  if (Util.isDefined(components.target) &&
      Util.isDefined(components.target.target)) {

    if (components.target.targetAge >= ent.weapon.fireRate){
      ent.fireAt(components.target.target.components.position);
    }

    if (components.target.targetAge === 0) {
      ent.addComponent(new MoveToPositionComponent(
        0,
        ent.game.player.x + Util.randomNegation(_.random(64, 128)),
        ent.game.player.y + Util.randomNegation(_.random(64, 128))
        )
      );
    }

    if (ent.weapon.cooldown > ent.weapon.fireRate * 0.25 &&
        ent.weapon.cooldown < ent.weapon.fireRate * 0.5) {
      components.movement.speed = 10;
    }
  }
}