function Renderer (game, canvas, decalCanvas) {
  this.game = game;
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.decalCanvas = decalCanvas;
  this.decalContext = decalCanvas.getContext('2d');
  this.shake = { x: 0, y: 0, reduction: 0.95 };

  // Nearest-neighbour scaling
  [this.context, this.decalContext].forEach(function (ctx) {
    ctx.imageSmoothingEnabled       = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled    = false;
  });
}

Renderer.prototype = {
  draw: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateCameraShake();
    this.shadowPass();
    this.spritePass();
    this.levelPass();
    this.infoPass();
    this.shakeElement(this.canvas);
    this.shakeElement(this.decalCanvas);
    this.rotate3d(document.getElementById('ui'), this.shake.y, Math.abs(this.shake.x), 0, Util.hypotenuse(this.shake.x, this.shake.y));
  },

  updateCameraShake: function () {
    this.shake.x *= this.shake.reduction;
    this.shake.y *= this.shake.reduction;
  },

  spritePass: function () {
    for (var i = 0; i < this.game.entities.length; i++) {
      var ent = this.game.entities[i];
      var rotation;

      if (ent.hasComponents('position')) {
        rotation = ent.components.position.direction;
      } else if (ent.hasComponents('movement')) {
        rotation = ent.components.movement.direction;
      }

      if (ent.hasComponents('renderSprite', 'position')) {
        var sprite = ent.components.renderSprite;
        var position = ent.components.position;

        this.context.save();
          this.context.setTransform(
            Math.cos(rotation) * sprite.scale,
            Math.sin(rotation) * sprite.scale,
           -Math.sin(rotation) * sprite.scale,
            Math.cos(rotation) * sprite.scale,
            position.x + sprite.offsetX,
            position.y + sprite.offsetY
          );
          this.context.drawImage(sprite.sprite, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
        this.context.restore();
      }
    }
  },

  infoPass: function () {
    var ent;
    for (var i = 0; i < this.game.entities.length; i++) {
      ent = this.game.entities[i];

      if (ent.hasComponents('renderInfo', 'position')) {
        this.context.save();
          this.context.setTransform(
            1, 0, 0, 1,
            ent.x + ent.drawOffset.x / 2 + this.shake.x / 2,
            ent.y + ent.drawOffset.y / 2 + this.shake.y / 2
          );

          var info = ent.components.renderInfo.info;
          var component = ent.components.renderInfo;

          // Update UI if info is dirty and has a UI element
          if (info.dirty) {
            if (info.addToHeroList) {
              ent.updateHeroListItem();
            }
            info.dirty = false;
          }

          // Update render-to-screen text cache iff any render-to-screen text changed
          if (info.drawDirty) {
            component.infoCanvas  = component.infoCanvas  || document.createElement('canvas');
            component.infoContext = component.infoContext || component.infoCanvas.getContext('2d');

            component.infoCanvas.width = 300;
            component.infoCanvas.height = (_.keys(info.text).length + 0.5) * info.lineHeight + 1;
            component.infoContext.font = info.font;
            component.infoContext.fillStyle = info.fill;

            var i = 0;
            _.each(_.where(info.text, { draw: true }), function (line, key) {
              var text = (line.prepend || '') + line.value + (line.postfix || '');
              component.infoContext.fillText(text, 0, ++i * info.lineHeight)
            });

            info.drawDirty = false;
          }

          this.context.drawImage(component.infoCanvas, info.offset.x, info.offset.y);
        this.context.restore();
      }
    }
  },

  shadowPass: function () {
    // Time of day shadow calculations
    // Shadow distortion (vector)
    // Imagine this is a semicircle, okay?
    //
    //     ________
    //    /\        \
    // y |  \ r      |  radius = offsetLength
    //   |__(>_______|
    //     (angle)
    //
    //   --- time --->

    var offsetLength = 30;
    var radians = this.game.dayRatio * Math.PI;
    var todXOffset = Math.cos(radians);
    var todYOffset = Math.sin(radians);

    for (var i = 0; i < this.game.entities.length; i++) {
      var ent = this.game.entities[i];

      if (ent.hasComponents('renderShadow', 'position')) {
        var shadow   = ent.components.renderShadow;
        var position = ent.components.position;
        var todSkew  = (Math.max(0.2, (Math.abs(this.game.dayRatio - 0.5))) * 2) * 4;
        // Turn off skewing. Useful for non-normal shadows such as explosion light flashes
        if (shadow.skew === false) { todSkew = 1; }

        this.context.save();
          this.context.setTransform(
            Math.cos(position.direction + radians) * shadow.scale * todSkew,
            Math.sin(position.direction + radians) * shadow.scale,
           -Math.sin(position.direction + radians) * shadow.scale * todSkew,
            Math.cos(position.direction + radians) * shadow.scale,
            position.x + this.shake.x / 3 + shadow.offsetX + todXOffset * offsetLength * (Math.abs(this.game.dayRatio - 0.5)) * 6,
            position.y + this.shake.y / 3 + shadow.offsetY + todYOffset * offsetLength * (1 - this.game.dayRatio)
          );

          this.context.fillStyle = shadow.color;

          if (shadow.shape === 'square') {
            this.context.fillRect(
              -ent.width / 2,
              -ent.height / 2,
              shadow.width,
              shadow.height
            );
          } else {
            this.context.beginPath();
            this.context.arc(0, 0, shadow.width, 0, 2 * Math.PI);
            this.context.fill();
          }
        this.context.restore();
      }
    }
  },

  levelPass: function() {
    if (Util.isDefined(this.game.level)) {
      this.game.level.draw();
    }
  },

  drawDecal: function (image, x, y, rotation, w, h, startFromBotLeft) {
    this.decalContext.save();
      w = w || image.naturalWidth;
      h = h || image.naturalHeight;

      this.decalContext.setTransform(
        Math.cos(rotation),
        Math.sin(rotation),
       -Math.sin(rotation),
        Math.cos(rotation),
        x,
        y
      );

      var xOffset = 0, yOffset = 0;
      if (!Util.isDefined(startFromBotLeft)) {
        xOffset -= w / 2;
        yOffset -= h / 2;
      }

      this.decalContext.drawImage(image, xOffset, yOffset, w, h);
    this.decalContext.restore();
  },

  shakeElement: function (el, scaling) {
    // Camera shake decal layer. This is done with CSS 3D transforms as we do not want to redraw canvas content.
    // Let the GPU do the heavy lifting!
    //
    // Camera shake for the regular canvas is still calculated since we're doing a full redraw (not optimised) anyway.

    scaling = scaling || 1;

    var transformation = 'translate3d(' +
      this.shake.x / this.game.ui.cssScale * scaling + 'px, ' +
      this.shake.y / this.game.ui.cssScale * scaling + 'px, ' +
      '0) ' +
      'rotateX(' + this.shake.y / 50 + 'deg) ' +
      'rotateY(' + -this.shake.x / 50 + 'deg)';

    el.style.transform = transformation;
    el.style["-webkit-transform"] = transformation;
  },

  translate3d: function (el, x, y, z) {
    z = z || 0;
    var transformation = "translate3d(" + x + "px," + y + "px," + z + "px)";
    el.style.transform = transformation;
    el.style["-webkit-transform"] = transformation;
  },

  rotate3d: function (el, x, y, z, deg) {
    var transformation = 'rotateX(' + this.shake.y / 50 + 'deg) rotateY(' + -this.shake.x / 50 + 'deg)';
    el.style.transform = transformation;
    el.style["-webkit-transform"] = transformation;
  }
};