function LineToTargetEffectComponent (position, target) {
  this.target = target;     // parent's target component
  this.position = position; // parent's position component
  this.active = true;
}

LineToTargetEffectComponent.prototype.draw = function (context) {
  if (this.active && Util.isDefined(this.target) && Util.isDefined(this.target.target)) {
    context.save();
      context.beginPath();
      context.moveTo(this.position.x, this.position.y);
      context.lineTo(this.target.target.components.position.x, this.target.target.components.position.y);
      context.strokeStyle = 'red';
      context.strokeWidth = 2;
      context.stroke();
    context.restore();
  }
}