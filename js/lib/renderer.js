/* eslint-disable indent */

function Renderer(game, canvas, decalCanvas, fadeCanvas, lightingCanvas) {
  this.game = game;
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.decalCanvas = decalCanvas;
  this.decalContext = decalCanvas.getContext("2d");
  this.fadeCanvas = fadeCanvas;
  this.fadeContext = fadeCanvas.getContext("2d");
  this.lightingCanvas = lightingCanvas;
  this.lightingContext = lightingCanvas.getContext("2d");
  this.ambientLightColor = "rgba(255, 255, 255, 1)";
  this.environmentLightColor = "rgba(255, 255, 255, 1)";
  this.lightingOpacity = 1;
  this.fadeContext.fillStyle = "rgba(0, 0, 0, 0.35)";
  this.shake = { x: 0, y: 0, reduction: 0.95 };
  this.clearContext = true;

  this.effectsUpdateRate = 1;
  this.effectsUpdateRateAdjustmentFrequency = 10;
  this.effectsUpdateRateAdjustmentCooldown = this.effectsUpdateRateAdjustmentFrequency;
  this.targetFps = 60;

  // Nearest-neighbour scaling
  [this.context, this.decalContext, this.fadeContext].forEach(function(ctx) {
    ctx.imageSmoothingEnabled = false;
  });
}

Renderer.prototype = {
  draw: function() {
    // Tone down effects if game starts lagging
    if (this.effectsUpdateRateAdjustmentCooldown < 0) {
      if (this.game.fps < this.targetFps) {
        this.effectsUpdateRate = Math.min(60, this.effectsUpdateRate + 1);
        this.effectsUpdateRateAdjustmentCooldown = this.effectsUpdateRateAdjustmentFrequency;
      } else if (this.game.fps >= this.targetFps) {
        this.effectsUpdateRate = Math.max(1, this.effectsUpdateRate - 1);
        this.effectsUpdateRateAdjustmentCooldown = this.effectsUpdateRateAdjustmentFrequency;
      }
    } else {
      this.effectsUpdateRateAdjustmentCooldown -= 1;
    }

    if (this.clearContext) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Trails
    this.fadeContext.fillRect(
      0,
      0,
      this.fadeCanvas.width,
      this.fadeCanvas.height
    );

    // Throttle slow effects, don't clear them off their canvas if they are throttled
    var updateEffects = this.game.age % this.effectsUpdateRate === 0;
    if (updateEffects) {
      this.lightingContext.clearRect(
        0,
        0,
        this.lightingCanvas.width,
        this.lightingCanvas.height
      );
      this.lightingContext.fillStyle = this.environmentLightColor;
      this.lightingContext.fillRect(
        0,
        0,
        this.lightingCanvas.width,
        this.lightingCanvas.height
      );
    }

    this.updateCameraShake();

    // Throttle slow effects
    if (updateEffects) {
      if (this.game.dayRatio != null && this.game.dayRatio > 0.4) {
        this.shadowPass();
      }
      this.lightingPass();
      this.levelPass();
      this.infoPass();
    }

    this.spritePass();

    this.shakeElement(this.canvas);
    this.shakeElement(this.decalCanvas);
    this.shakeElement(this.fadeCanvas);
    this.shakeElement(this.lightingCanvas);
    this.rotate3d(
      document.getElementById("ui"),
      this.shake.y,
      Math.abs(this.shake.x),
      0,
      Util.hypotenuse(this.shake.x, this.shake.y)
    );
  },

  updateCameraShake: function() {
    this.shake.x *= this.shake.reduction;
    this.shake.y *= this.shake.reduction;
  },

  spritePass: function() {
    // Transformation matrix
    // [ a, c, e ]
    // [ b, d, f ]
    // setTransform(a, b, c, d, e, f)

    var ent;
    for (var i = 0; i < this.game.entities.length; i++) {
      ent = this.game.entities[i];
      this.context.save();
      this.setContextTransform(this.context, ent);
      ent.drawHighlight(this.context);

      if (ent.drawFade === true) {
        this.fadeContext.save();
        this.setContextTransform(this.fadeContext, ent);
        ent.drawFadingImage(this.fadeContext);
        this.fadeContext.restore();
      } else if (ent.opacity && ent.opacity !== 1) {
        this.context.globalAlpha = ent.opacity;
        ent.drawImage(this.context);
        ent.draw(this.context);
        this.context.globalAlpha = 1;
      } else {
        ent.drawImage(this.context);
        ent.draw(this.context);
      }

      // TODO: handle fading hats
      ent.drawHats(this.context);

      this.context.restore();
    }
  },

  lightingPass: function() {
    var ent;
    for (var i = 0; i < this.game.entities.length; i++) {
      ent = this.game.entities[i];
      this.lightingContext.save();
      this.setContextTransformLighting(this.lightingContext, ent);
      ent.drawLighting(this.lightingContext);
      this.lightingContext.restore();
    }
  },

  setContextTransform: function(context, ent) {
    context.setTransform(
      Math.cos(ent.rotation) * ent.scale * ent.drawOffset.scaleX,
      Math.sin(ent.rotation) * ent.scale * ent.drawOffset.scaleY,
      -Math.sin(ent.rotation) * ent.scale * ent.drawOffset.scaleX,
      Math.cos(ent.rotation) * ent.scale * ent.drawOffset.scaleY,
      ent.x + ent.drawOffset.x,
      ent.y + ent.drawOffset.y
    );
  },

  setContextTransformLighting: function(context, ent) {
    context.setTransform(
      Math.cos(ent.rotation) * ent.scale * ent.drawOffset.scaleX,
      Math.sin(ent.rotation) * ent.scale * ent.drawOffset.scaleY,
      -Math.sin(ent.rotation) * ent.scale * ent.drawOffset.scaleX,
      Math.cos(ent.rotation) * ent.scale * ent.drawOffset.scaleY,
      ent.x + ent.lightOffsetX,
      ent.y + ent.lightOffsetY
    );
  },

  infoPass: function() {
    var ent;
    for (var i = 0; i < this.game.entities.length; i++) {
      ent = this.game.entities[i];
      if (ent.info.draw) {
        this.context.save();
        this.context.setTransform(
          1,
          0,
          0,
          1,
          ent.x + ent.drawOffset.x / 2 + this.shake.x / 2,
          ent.y + ent.drawOffset.y / 2 + this.shake.y / 2
        );
        ent.drawInformation(this.context);
        this.context.restore();
      }
    }
  },

  shadowPass: function() {
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
    var radians = (this.game.dayRatio - 0.333) * 1.5 * Math.PI;
    var todXOffset = Math.cos(radians);
    var todYOffset = Math.sin(radians);

    var ent;
    for (var i = 0; i < this.game.entities.length; i++) {
      ent = this.game.entities[i];
      if (ent.shadow && ent.shadow.on) {
        this.context.save();
        var todSkew = Math.max(0.2, Math.abs(this.game.dayRatio - 0.5)) * 2 * 4;

        // Turn off shadow skewing if todScale is 0
        // Useful for non-normal shadows such as explosion light flashes
        var todScale = ent.shadow.todScale || 1;
        if (Util.isDefined(ent.shadow.todScale) && ent.shadow.todScale === 0) {
          todSkew = 1;
        }

        // Transform to shadow position and rotate/skew it for time of day
        this.context.setTransform(
          Math.cos(ent.rotation + radians * todScale) *
            ent.scale *
            ent.drawOffset.scaleX *
            todSkew,
          Math.sin(ent.rotation + radians * todScale) *
            ent.scale *
            ent.drawOffset.scaleY,
          -Math.sin(ent.rotation + radians * todScale) *
            ent.scale *
            ent.drawOffset.scaleX *
            todSkew,
          Math.cos(ent.rotation + radians * todScale) *
            ent.scale *
            ent.drawOffset.scaleY,
          ent.x +
            ent.drawOffset.x -
            this.shake.x / 3 +
            ent.shadow.offset.x +
            todScale *
              (todXOffset *
                offsetLength *
                (Math.abs(this.game.dayRatio - 0.5) * 2) *
                3),
          ent.y +
            ent.drawOffset.y +
            this.shake.y / 3 +
            ent.shadow.offset.y +
            todScale * (todYOffset * offsetLength * (1 - this.game.dayRatio))
        );

        this.context.fillStyle = ent.shadow.color;

        if (ent.shadow.shape === "square") {
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

  drawFadingDecal: function(image, x, y, rotation, w, h, startFromBotLeft) {
    this.drawOnContext(
      this.fadeContext,
      image,
      x,
      y,
      rotation,
      w,
      h,
      startFromBotLeft
    );
  },

  drawDecal: function(image, x, y, rotation, w, h, startFromBotLeft) {
    this.drawOnContext(
      this.decalContext,
      image,
      x,
      y,
      rotation,
      w,
      h,
      startFromBotLeft
    );
  },

  drawOnContext: function(
    context,
    image,
    x,
    y,
    rotation,
    w,
    h,
    startFromBotLeft
  ) {
    context.save();
    w = w || image.naturalWidth;
    h = h || image.naturalHeight;

    context.setTransform(
      Math.cos(rotation),
      Math.sin(rotation),
      -Math.sin(rotation),
      Math.cos(rotation),
      x,
      y
    );

    var xOffset = 0;
    var yOffset = 0;
    if (!Util.isDefined(startFromBotLeft)) {
      xOffset -= w / 2;
      yOffset -= h / 2;
    }

    context.drawImage(image, xOffset, yOffset, w, h);
    context.restore();
  },

  shakeElement: function(el, scaling) {
    // Camera shake decal layer. This is done with CSS 3D transforms as we do not want to redraw canvas content.
    // Let the GPU do the heavy lifting!
    //
    // Camera shake for the regular canvas is still calculated since we're doing a full redraw (not optimised) anyway.

    scaling = scaling || 1;

    var transformation =
      "translate3d(" +
      this.shake.x / this.game.ui.cssScale * scaling +
      "px, " +
      this.shake.y / this.game.ui.cssScale * scaling +
      "px, " +
      "0) " +
      "rotateX(" +
      this.shake.y / 50 +
      "deg) " +
      "rotateY(" +
      -this.shake.x / 50 +
      "deg)";

    el.style.transform = transformation;
  },

  translate3d: function(el, x, y, z) {
    z = z || 0;
    var transformation = "translate3d(" + x + "px," + y + "px," + z + "px)";
    el.style.transform = transformation;
  },

  rotate3d: function(el, _x, _y, _z, _deg) {
    var transformation =
      "rotateX(" +
      this.shake.y / 50 +
      "deg) rotateY(" +
      -this.shake.x / 50 +
      "deg)";
    el.style.transform = transformation;
  }
};
