function RenderShadowComponent (width, height, color, shape, scale, skew) {
  this.width = width || 45;
  this.height = height || 45;
  this.color = color || 'rgba(0, 0, 0, 0.3)';
  this.shape = shape || 'square';
  this.scale = 1;
  this.skew = skew;
  this.offsetX = 0;
  this.offsetY = 0;
  this.type = 'renderShadow';
}