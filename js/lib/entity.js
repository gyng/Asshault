function Entity(resources, overrides) {
  this.width = 0;
  this.height = 0;
  this.x = 0;
  this.y = 0;
  this.scale = 1;
  this.rotation = 0; // Image
  this.direction = 0; // Movement heading
  this.age = 0;
  this.drawOffset = { x: 0, y: 0 };
  this.speed = 0;
  this.upgrades = [];
  this.moveTarget = { x: 0, y: 0 };
  this.health = 0;
  this.lastHitBy = null;

  if (typeof resources !== 'undefined') {
    this.sprites = resources.sprites;
    this.sounds = resources.sounds;
    this.game = resources.game;
    this.resources = resources;
  }

  this.shadow = {
    on: false,
    offset: {x: 0, y: 0},
    color: "rgba(0, 0, 0, 0.3)",
    size: { x: 45, y: 45 },
    shape: 'square',
    todScale: 1
  };

  this.info = {
    draw: false,
    text: [], // ['line1', 'line2']
    fill: '#0f0',
    font: 'bold 20px Arial',
    strokeStyle: '#000',
    strokeWidth: 2,
    lineHeight: 28,
    offset: { x: 0, y: 0 },
    dirty: true
  };



  this.markedForDeletion = false;

  this.overrides = overrides || {};
  this.applyOverrides();
}

Entity.prototype = {
  tick: function () {},

  tock: function () {
    if (this.age === 1) this.info.dirty = true;
    this.age++;
  },

  draw: function (context) {},

  drawHighlight: function (context) {
    if (this.highlighted) {
      context.beginPath();
      context.fillStyle = "rgba(247, 243, 37, 0.5)";
      context.arc(0, 0, hypotenuse(this.width, this.height) * 1.5, 0, 2 * Math.PI);
      context.fill();
    }
  },

  drawInformation: function (context) {
    // Buffer text in a canvas as fillText is really really slow
    this.infoCanvas  = this.infoCanvas  || document.createElement('canvas');
    this.infoContext = this.infoContext || this.infoCanvas.getContext('2d');

    if (this.info.dirty) {
      this.infoCanvas.width = 300;
      this.infoCanvas.height = this.info.text.length * this.info.lineHeight + 1;
      this.infoContext.font = this.info.font;
      this.infoContext.fillStyle = this.info.fill;
      this.info.text = [].concat.apply(this.info.text);
      this.info.text.forEach(function (line, i) {
        this.infoContext.fillText(line, 0, (i+1) * this.info.lineHeight);
      }.bind(this));

      this.info.dirty = false;
    }

    context.drawImage(this.infoCanvas, this.info.offset.x, this.info.offset.y);
  },

  getImage: function () {},

  applyOverrides: function () {
    _.keys(this.overrides).forEach(function (key) {
      this[key] = this.overrides[key];

    }.bind(this));
  },

  collidesWith: function(object, threshold) {
    if (typeof threshold === 'undefined') { threshold = 20; }
    return this.distanceTo(object) < threshold ? true : false;
  },

  distanceTo: function (object) {
    return hypotenuse(object.x - this.x, object.y - this.y);
  },

  lookAt: function (object) {
    this.rotation = Math.atan2(object.x - this.x, this.y - object.y);
  },

  executeUpgrades: function () {
    this.upgrades.forEach(function (upgrade) {
      upgrade.call(this);
    }.bind(this));
  },

  moveToTarget: function (speed, scaling) {
    this.moveTo(this.moveTarget.x, this.moveTarget.y, speed, scaling);
  },

  moveTo: function (x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = normalize({ x: x - this.x, y: y - this.y });
    this.x += normalized.x * speed * scaling;
    this.y += normalized.y * speed * scaling;
  },

  moveForward: function(speed, scaling) {
    this.moveInDirection(this.direction, speed, scaling);
  },

  moveInDirection: function(direction, speed, scaling) {
    speed   = speed || this.speed;
    scaling = scaling || 1;
    this.y -= Math.cos(direction) * speed * scaling;
    this.x += Math.sin(direction) * speed * scaling;
  },

  getMoveDelta: function (x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = normalize({ x: x - this.x, y: y - this.y });
    return { x: normalized.x * this.speed * scaling, y: normalized.y * this.speed * scaling };
  },

  getPosition: function () {
    return { x: this.x, y: this.y };
  },

  die: function () {
    this.markedForDeletion = true;
  },

  damage: function(damage, by) {
    this.health -= damage;
    this.lastHitBy = by;
  },

  say: function (text, duration) {
    // Use DOM for delicious CSS and (!)text wrapping!
    this.game.ui.createSpeechBubble(null, this.x, this.y - this.height * 2, text, duration);
  },

  every: function(mod, fun, args) {
    args = args || [];
    if (this.age % mod === 0) {
      fun.apply(this, [].concat(args));
    }
  },

  // Hero stuff, TODO: split into 'subclass'
  addXP: function (xp, kills) {
    this.xp += xp;
    this.kills += kills || 0;
  },

  checkLevelUp: function (requiredXp) {
    requiredXp = requiredXp || 100;
    if (this.xp >= 100) {
      this.xp = this.xp - 100;
      this.level += 1;

      if (this.sounds && this.sounds.levelup)
        this.game.audio.play(this.sounds.levelup);
    }
  },

  checkHeroInfo: function () {
    if (this.info.text.length === 3 &&
        this.xp !== parseInt(this.info.text[2].slice(0, -2), 10))
      this.info.dirty = true;

    this.info.text = [
      this.name,
      'Level ' + this.level,
      this.xp + 'xp'
    ];
  },

  updateHeroListItem: function () {
    this.uiElem = this.uiElem || this.game.ui.addToHeroList(this);
    this.game.ui.updateHeroListItem(this.uiElem, this);
  }
};
