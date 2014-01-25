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