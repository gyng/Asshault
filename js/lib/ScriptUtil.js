window.ScriptUtil = {
  faceTarget: function (position, target) {
    position.facing = Math.atan2(target.target.components.position.y - position.y, target.target.components.position.x - position.x);
  },

  hasValidTarget: function (target) {
    return Util.isDefined(target) && Util.isDefined(target.target);
  }
}