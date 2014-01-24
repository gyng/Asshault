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

    this.legacy();

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

  legacy: function () {
    for (var i = 0; i < this.game.entities.length; i++) {
      var ent = this.game.entities[i];
        // TODO: REMOVE
        ent.drawOffset.x = Util.clamp(ent.drawOffset.x * 0.9, 0, 72);
        ent.drawOffset.y = Util.clamp(ent.drawOffset.y * 0.9, 0, 72);
    }
  },

  spritePass: function () {
    for (var i = 0; i < this.game.entities.length; i++) {
      var ent = this.game.entities[i];
      var rotation;

      if (Util.isDefined(ent.components.movement)) {
        rotation = ent.components.movement.direction;
      } else if (Util.isDefined(ent.components.position)) {
        rotation = ent.components.position.direction;
      }

      if (Util.isDefined(ent.components.renderSprite) && Util.isDefined(ent.components.position)) {
        ent.components.renderSprite.draw(
          this.context,
          ent.components.position.x,
          ent.components.position.y,
          rotation
        );
      }
    }
  },

  infoPass: function () {
    var ent;
    for (var i = 0; i < this.game.entities.length; i++) {
      ent = this.game.entities[i];
      if (ent.info.draw) {
        this.context.save();
          this.context.setTransform(
            1, 0, 0, 1,
            ent.x + ent.drawOffset.x / 2 + this.shake.x / 2,
            ent.y + ent.drawOffset.y / 2 + this.shake.y / 2
          );
          ent.drawInformation(this.context);
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

    var ent;
    for (var i = 0; i < this.game.entities.length; i++) {
      ent = this.game.entities[i];
      if (ent.shadow.on) {
        this.context.save();
          var todSkew =  (Math.max(0.2, (Math.abs(this.game.dayRatio - 0.5))) * 2) * 4;

          // Turn off shadow skewing if todScale is 0
          // Useful for non-normal shadows such as explosion light flashes
          var todScale = ent.shadow.todScale || 1;
          if (Util.isDefined(ent.shadow.todScale) && ent.shadow.todScale === 0) { todSkew = 1; }

          // Transform to shadow position and rotate/skew it for time of day
          this.context.setTransform(
            Math.cos(ent.rotation + radians * todScale) * ent.scale * todSkew,
            Math.sin(ent.rotation + radians * todScale) * ent.scale,
           -Math.sin(ent.rotation + radians * todScale) * ent.scale * todSkew,
            Math.cos(ent.rotation + radians * todScale) * ent.scale,
            ent.x + ent.drawOffset.x - this.shake.x / 3 + ent.shadow.offset.x + (todScale * (todXOffset * offsetLength * ((Math.abs(this.game.dayRatio - 0.5)) * 2) * 3)),
            ent.y + ent.drawOffset.y + this.shake.y / 3 + ent.shadow.offset.y + (todScale * (todYOffset * offsetLength * (1 - this.game.dayRatio)))
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