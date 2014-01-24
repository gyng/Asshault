function RenderSpriteComponent (sprite, x, y, rotation, scale, width, height, offsetX, offsetY) {
  this.type = 'renderSprite';
  this.sprite   = sprite;
  this.x        = x        || 10;
  this.y        = y        || 10;
  this.rotation = rotation || 0;
  this.scale    = scale    || 1;
  this.width    = width    || 50;
  this.height   = height   || 50;
  this.offsetX  = offsetX  || 0;
  this.offsetY  = offsetY  || 0;
}

RenderSpriteComponent.prototype.draw = function (context, x, y, rotation, scale, width, height, offsetX, offsetY) {
  x        = x        || this.x;
  y        = y        || this.y;
  rotation = rotation || this.rotation;
  scale    = scale    || this.scale;
  width    = width    || this.width;
  height   = height   || this.height;
  offsetX  = offsetX  || this.offsetX;
  offsetY  = offsetY  || this.offsetY;

  context.save();
    // Transformation matrix
    // [ a, c, e ]
    // [ b, d, f ]
    // setTransform(a, b, c, d, e, f)
    context.setTransform(
      Math.cos(rotation) * scale,
      Math.sin(rotation) * scale,
     -Math.sin(rotation) * scale,
      Math.cos(rotation) * scale,
      x + offsetX,
      y + offsetY
    );
    context.drawImage(this.sprite, -width / 2, -height / 2, width, height);
  context.restore();
};