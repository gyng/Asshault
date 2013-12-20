function Level (game, script) {
  this.game = game;
  this.age = 0;
  this.length = 0;
  this.over = false;
  this.script = script || { /* 0: { f: function () { this.started = true; }, a: [arg1, arg2] */ };
}

Level.prototype = {
  tick: function () {

  },

  tock: function () {
    if (isDefined(this.script[this.age])) {
      this.script[this.age].f.apply(this.game, [].concat(this.script[this.age].a));
    }

    this.age++;
  },

  draw: function () {

  }
};

function BreakLevel(game, script) {
  script = script || {};
  Level.call(this, script);

  var that = this;

  $('.ui .ready-button').show();
  $('.ui .ready-button').on('click', function () {
    $(this).hide();
    that.over = true;
  });
}

BreakLevel.prototype = new Level();

BreakLevel.prototype.constructor = BreakLevel;

BreakLevel.prototype.tick = function () {
  this.x += this.deltaX;
  this.y += this.deltaY;
};