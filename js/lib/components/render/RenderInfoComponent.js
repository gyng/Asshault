function RenderInfoComponent (info) {
  this.type = 'renderInfo';
  this.info = _.extend({
    draw: true,
    text: {},
    fill: '#0f0',
    font: 'normal 20px Arial',
    strokeStyle: '#000',
    strokeWidth: 2,
    lineHeight: 28,
    offset: { x: 0, y: 0 },
    dirty: true,
    drawDirty: true,
    iconDirty: true,
    addToHeroList: false,
    upgradeIcons: []
  }, (info || {}));
  this.lastInfo = _.clone(this.info);
}

RenderInfoComponent.prototype.checkInfo = function () {
  if (JSON.stringify(this.info.text) !== JSON.stringify(this.lastInfo)) {
    this.info.dirty = true;

    if (JSON.stringify(_.where(this.info.text, { draw: true })) ===
        JSON.stringify(_.where(this.lastInfo,  { draw: true }))) {
      this.info.drawDirty = true;
    }

    this.lastInfo = _.clone(this.info);
  }
}