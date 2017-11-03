function Entity(resources, overrides) {
  this.width = 0;
  this.height = 0;
  this.x = 0;
  this.y = 0;
  this.scale = 1;
  this.rotation = 0; // Image
  this.direction = 0; // Movement heading
  this.age = 0;
  this.drawOffset = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  this.speed = 0;
  this.upgrades = [];
  this.moveTarget = { x: 0, y: 0 };
  this.health = 0;
  this.lastHitBy = null;
  this.gold = 0;
  this.taxRate = 0.25;
  this.collisionRadius = 20;
  this.opacity = 1;
  this.lightRadius = 0;
  this.lightRadiusScale = 1;
  this.lightColor = "rgba(255, 255, 255, 1)";
  this.innerLightRadius = 0;
  this.lightDirection = null;
  this.lightOffsetX = 0;
  this.lightOffsetY = 0;
  this.lightRadiusWobble = 0;

  this.alignment = "none";
  this.friendlyPierceChance = 0;
  this.enemyPierceChance = 0;
  this.weapons = [];
  this.hats = [];

  if (typeof resources !== "undefined") {
    this.sprites = resources.sprites;
    this.sprite = resources.sprites.transparent;
    this.sounds = resources.sounds;
    this.game = resources.game;
    this.resources = resources;
  }

  this.shadow = {
    on: false,
    offset: { x: 0, y: 0 },
    color: "rgba(0, 0, 0, 0.3)",
    size: { x: 45, y: 45 },
    shape: "square",
    todScale: 1
  };

  // Information exposed to UI elements
  this.info = {
    draw: false,
    text: {},
    fill: "#0f0",
    font: "bold 20px Megrim",
    strokeStyle: "#000",
    strokeWidth: 2,
    lineHeight: 28,
    offset: { x: 0, y: 0 },
    dirty: true,
    drawDirty: true,
    iconDirty: true,
    addToHeroList: false,
    upgradeIcons: []
  };

  this.lastInfo = _.clone(this.info); // For doing dirty checks
  this.markedForDeletion = false;
  this.overrides = overrides || {};
  this.applyOverrides();
  this.startingHealth = this.health;
}

Entity.prototype = {
  tick: function() {},

  tock: function() {
    if (this.age === 1) this.info.dirty = true;
    if (this.weapon) this.weapon.tock();
    this.age++;
  },

  draw: function(_context) {},

  drawHats: function(context) {
    for (var i = 0; i < this.hats.length; i++) {
      if (typeof this.hats[i].draw === "function") {
        this.hats[i].draw(context);
      }
    }
  },

  drawHighlight: function(context) {
    if (this.highlighted) {
      context.beginPath();
      context.fillStyle = this.highlightColor || "rgba(247, 243, 37, 0.5)";
      context.arc(
        0,
        0,
        Util.hypotenuse(this.width, this.height) * 1.5,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  },

  drawImage: function(context) {
    var image = this.getImage();

    if (image) {
      context.drawImage(
        image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }
  },

  drawFadingImage: function(context) {
    this.drawImage(context);
  },

  drawLighting: function(lightingContext) {
    if (this.lightRadius > 0) {
      var endCircle =
        this.lightDirection == null
          ? { x: 0, y: 0 }
          : Util.offsetPosition(this.rotation, this.lightRadius);

      var wobbleOuter = Util.randomError(this.lightRadiusWobble);
      var wobbleInner = Util.randomError(this.lightRadiusWobble);

      var outerRadius =
        Math.max(0.1, (this.lightRadius || 0) + wobbleOuter) *
        (this.lightRadiusScale || 1);
      var innerRadius =
        Util.clamp(this.innerLightRadius + wobbleInner, 0, outerRadius) *
        (this.lightRadiusScale || 1);

      var gradient = lightingContext.createRadialGradient(
        0,
        0,
        outerRadius,
        endCircle.x,
        endCircle.y,
        innerRadius
      );
      gradient.addColorStop(0, this.game.renderer.ambientLightColor);
      gradient.addColorStop(1, this.lightColor);

      lightingContext.fillStyle = gradient;

      lightingContext.fillRect(
        -outerRadius,
        -outerRadius,
        outerRadius * 2,
        outerRadius * 2
      );
    }
  },

  drawInformation: function(context) {
    // Per-entity buffer text to be drawn to canvas in a separate canvas as fillText is really really slow
    this.infoCanvas = this.infoCanvas || document.createElement("canvas");
    this.infoContext = this.infoContext || this.infoCanvas.getContext("2d");

    // If the info is dirty we just update the UI anyway
    if (this.info.dirty) {
      if (this.info.addToHeroList) {
        this.updateHeroListItem();
      }
      this.info.dirty = false;
    }

    // If any of the info to be drawn to canvas is dirty only then do we rebuffer and redraw it
    if (this.info.drawDirty) {
      this.infoCanvas.width = 300;
      // +1 for zero-height canvases not showing up
      this.infoCanvas.height =
        (_.keys(this.info.text).length + 0.5) * this.info.lineHeight + 1;
      this.infoContext.font = this.info.font;
      this.infoContext.fillStyle = this.info.fill;

      var i = 0;
      _.each(
        _.filter(this.info.text, { draw: true }),
        function(line, _key) {
          var text = (line.prepend || "") + line.value + (line.postfix || "");
          this.infoContext.fillText(text, 0, ++i * this.info.lineHeight);
        }.bind(this)
      );

      this.info.drawDirty = false;
    }

    context.drawImage(this.infoCanvas, this.info.offset.x, this.info.offset.y);
  },

  getImage: function() {
    return this.sprite;
  },

  applyOverrides: function() {
    _.keys(this.overrides).forEach(
      function(key) {
        this[key] = this.overrides[key];
      }.bind(this)
    );
  },

  collidesWith: function(object, threshold) {
    return this.distanceTo(object) < (threshold || this.collisionRadius);
  },

  distanceTo: function(object) {
    return Util.hypotenuse(object.x - this.x, object.y - this.y);
  },

  lookAt: function(object) {
    this.rotation = Math.atan2(object.x - this.x, this.y - object.y);
  },

  executeUpgrades: function() {
    for (var i = 0; i < this.upgrades.length; i++) {
      this.upgrades[i].call(this);
    }
  },

  moveToTarget: function(speed, scaling) {
    this.moveTo(this.moveTarget.x, this.moveTarget.y, speed, scaling);
  },

  moveTo: function(x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = Util.normalize({ x: x - this.x, y: y - this.y });
    this.x += normalized.x * speed * scaling;
    this.y += normalized.y * speed * scaling;
  },

  moveForward: function(speed, scaling) {
    this.moveInDirection(this.direction, speed, scaling);
  },

  moveInDirection: function(direction, speed, scaling) {
    speed = speed || this.speed;
    scaling = scaling || 1;
    this.y -= Math.cos(direction) * speed * scaling;
    this.x += Math.sin(direction) * speed * scaling;
  },

  getMoveDelta: function(x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = Util.normalize({ x: x - this.x, y: y - this.y });
    return {
      x: normalized.x * this.speed * scaling,
      y: normalized.y * this.speed * scaling
    };
  },

  getPosition: function() {
    return { x: this.x, y: this.y };
  },

  die: function() {
    this.markedForDeletion = true;
  },

  damage: function(damage, by) {
    if (this.sounds && this.sounds.hurt) {
      this.game.audio.play(this.sounds.hurt);
    }

    this.health -= damage;
    this.lastHitBy = by;

    if (this.constructor === Player && this.health <= 0) {
      this.game.gameOver = true;
      this.game.ui.gameOver();
    }
  },

  addGold: function(amount) {
    this.gold += amount;
  },

  say: function(text, duration) {
    // Use DOM for delicious CSS and !text wrapping!
    this.game.ui.createSpeechBubble(
      null,
      this.x,
      this.y - this.height * 2,
      text,
      duration
    );
  },

  popup: function(text, duration, template) {
    // Use DOM for delicious CSS and !text wrapping!
    this.game.ui.createPopup(
      template,
      this.x,
      this.y - this.height * 2,
      text,
      duration
    );
  },

  // Enemy stuff
  checkBullets: function(reloadCost) {
    if (!this.weapon) return;

    reloadCost = reloadCost || 10;

    if (this.weapon.bullets === 0) {
      if (this.gold >= reloadCost) {
        this.popup(
          "Reloading!",
          this.weapon.reloadTime * 3,
          "#template-speech-popup"
        );
        this.gold -= reloadCost;
        this.updateInfo();

        window.setTimeout(
          function() {
            this.popup("-" + reloadCost, 650, "#template-gold-popup");
          }.bind(this),
          this.weapon.reloadTime
        );

        this.weapon.reload();
      } else {
        this.weapon.cooldown += this.weapon.fireRate * 2;
        this.weapon.bullets += 1;
        this.popup(
          "Need " + reloadCost + "G for bullets!",
          this.weapon.cooldown * 2,
          "#template-speech-popup"
        );
        this.game.audio.play(this.weapon.sounds.empty, 1.0);
      }
    }
  },

  updateInfo: function() {},

  // Hero stuff, TODO: split into 'subclass'
  addXP: function(xp, kills) {
    this.xp += xp;
    this.kills += kills || 0;
  },

  checkLevelUp: function(requiredXp) {
    requiredXp = requiredXp || 100;
    if (this.xp >= requiredXp) {
      this.xp = 0;
      this.level += 1;

      if (this.sounds && this.sounds.levelup) {
        this.game.audio.play(this.sounds.levelup);
      }

      this.levelUp();
    }
  },

  levelUp: function() {},

  checkHeroInfo: function() {
    // Two types of info: UI info and canvas info.
    // Updating canvas info is much more expensive so we do a separate check for that info.
    if (JSON.stringify(this.info.text) === JSON.stringify(this.lastInfo)) {
      this.info.dirty = true;

      if (
        JSON.stringify(_.where(this.info.text, { draw: true })) ===
        JSON.stringify(_.where(this.lastInfo, { draw: true }))
      ) {
        this.info.drawDirty = true;
      }
    }

    this.info.dirty = true;
    this.lastInfo = _.clone(this.info.text);
  },

  setSpatialVolume: function(earshot) {
    earshot = earshot || 300;
    var distance = this.distanceTo(this.game.player);
    var volumeModifier = Util.clamp(earshot / distance, 0.5, 2);
    if (this.weapon) this.weapon.volumeModifier = volumeModifier;
  },

  updateHeroListItem: function() {
    this.uiElem = this.uiElem || this.game.ui.addToHeroList(this);
    this.game.ui.updateHeroListItem(this.uiElem, this);
  },

  addUpgrade: function(entityUpgrade) {
    // Not the full upgrade but a JS object {*effect: function, *icon: image}
    if (Util.isDefined(entityUpgrade.effect)) {
      this.upgrades.push(entityUpgrade.effect);
    }

    if (Util.isDefined(entityUpgrade.icon)) {
      this.game.ui.addHeroUpgradeIcon(
        this.uiElem,
        entityUpgrade.icon,
        entityUpgrade.tooltip
      );
    }
  },

  returnToMap: function(returnScale, margin) {
    returnScale = returnScale || 0.05;
    margin = margin || 50;

    if (this.x > this.game.canvas.width - margin) {
      this.x -= returnScale * (this.x - (this.game.canvas.width - margin));
    } else if (this.x < margin) {
      this.x += returnScale * (margin - this.x);
    }

    if (this.y > this.game.canvas.height - margin) {
      this.y -= returnScale * (this.y - (this.game.canvas.height - margin));
    } else if (this.y < margin) {
      this.y += returnScale * (margin - this.y);
    }
  }
};
