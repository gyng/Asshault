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
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateCameraShake();
    this.shadowPass();
    this.spritePass();
    this.levelPass();
    this.infoPass();
    this.shakeDecalLayer();
  },

  updateCameraShake: function () {
    this.shake.x *= this.shake.reduction;
    this.shake.y *= this.shake.reduction;
  },

  spritePass: function () {
    // Transformation matrix
    // [ a, c, e ]
    // [ b, d, f ]
    // setTransform(a, b, c, d, e, f)

    this.game.entities.forEach(function (ent) {
      this.context.save();
        this.context.setTransform(
          Math.cos(ent.rotation) * ent.scale,
          Math.sin(ent.rotation) * ent.scale,
         -Math.sin(ent.rotation) * ent.scale,
          Math.cos(ent.rotation) * ent.scale,
          ent.x + ent.drawOffset.x + this.shake.x,
          ent.y + ent.drawOffset.y + this.shake.y
        );

        this.context.drawImage(ent.getImage(), -ent.width / 2, -ent.height / 2, ent.width, ent.height);
        ent.draw(this.context);
      this.context.restore();
    }.bind(this));
  },

  infoPass: function () {
    this.game.entities.forEach(function (ent) {
      if (ent.info.draw) {
        this.context.save();
          this.context.setTransform(
            1, 0, 0, 1,
            ent.x + this.shake.x,
            ent.y + this.shake.y
          );
          ent.drawInformation(this.context);
        this.context.restore();
      }
    }.bind(this));
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
    var dayLength = 1440;
    var timeOfDay = this.game.age % dayLength;
    var dayRatio = 1 - timeOfDay / dayLength;
    var radians = dayRatio * Math.PI;
    var todXOffset = Math.cos(radians);
    var todYOffset = Math.sin(radians);

    this.game.entities.forEach(function (ent) {
      if (ent.shadow.on) {
        this.context.save();
          var todSkew =  (Math.max(0.2, (Math.abs(dayRatio - 0.5))) * 2) * 4;

          // Turn off shadow skewing if todScale is 0
          // Useful for non-normal shadows such as explosion light flashes
          var todScale = ent.shadow.todScale || 1;
          if (isDefined(ent.shadow.todScale) && ent.shadow.todScale === 0) { todSkew = 1; }

          // Transform to shadow position and rotate/skew it for time of day
          this.context.setTransform(
            Math.cos(ent.rotation + radians * todScale) * ent.scale * todSkew,
            Math.sin(ent.rotation + radians * todScale) * ent.scale,
           -Math.sin(ent.rotation + radians * todScale) * ent.scale * todSkew,
            Math.cos(ent.rotation + radians * todScale) * ent.scale,
            ent.x + ent.drawOffset.x + this.shake.x + ent.shadow.offset.x + (todScale * (todXOffset * offsetLength * ((Math.abs(dayRatio - 0.5)) * 2) * 3)),
            ent.y + ent.drawOffset.y + this.shake.y + ent.shadow.offset.y + (todScale * (todYOffset * offsetLength * (1 - dayRatio)))
          );

          this.context.fillStyle = ent.shadow.color;

          if (ent.shadow.shape === 'square') {
            this.context.fillRect(
              -ent.width / 2,
              -ent.height / 2,
              ent.shadow.size.x,
              ent.shadow.size.y
            );
          } else {
            this.context.beginPath();
            this.context.arc(0, 0, ent.shadow.size.x, 0, 2 * Math.PI);
            this.context.fill();
          }
        this.context.restore();
      }
    }.bind(this));
  },

  levelPass: function() {
    if (isDefined(this.game.level)) {
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
      if (!isDefined(startFromBotLeft)) {
        xOffset -= w / 2;
        yOffset -= h / 2;
      }

      this.decalContext.drawImage(image, xOffset, yOffset, w, h);
    this.decalContext.restore();
  },

  shakeDecalLayer: function () {
    // Camera shake decal layer. This is done with CSS 3D transforms as we do not want to redraw canvas content.
    // Let the GPU do the heavy lifting!
    //
    // Camera shake for the regular canvas is still calculated since we're doing a full redraw (not optimised) anyway.

    var transformation = "translate3d(" +
      (this.shake.x / this.game.cssScale) + "px," +
      (this.shake.y / this.game.cssScale) + "px, 0)";
    this.decalCanvas.style.transform = transformation;
    this.decalCanvas.style["-webkit-transform"] = transformation;
  }
};