function SpriteBlinkEffectComponent (position, sprite, width, height, interval, onDuration) {
  this.type = 'effect';
  this.position = position; // parent's position component
  this.sprite = sprite;
  this.width = width;
  this.height = height;
  this.interval = interval;
  this.onDuration = onDuration;
  this.active = true;
  this.age = 0;
}

SpriteBlinkEffectComponent.prototype.draw = function (context) {
  if (this.active && this.age++ % this.interval < this.onDuration) {
    context.save();
      context.translate(this.position.x, this.position.y);
      context.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    context.restore();
  }
}