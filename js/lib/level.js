function Level (game, script) {
  this.game = game;
  this.age = 0;
  this.length = 0;
  this.over = false;
  this.script = script || { /* 0: { f: function () { this.started = true; }, a: [arg1, arg2] */ };
  this.that = this;
}

Level.prototype = {
  tick: function () {

  },

  tock: function () {
    // Level event definition: {
    //   f: function () { this == game },
    //   a: [arg1, arg2] || arg1,
    //   r: repeatIntervalInFrames
    // }
    //
    // Function is applied with its binding for `this` as the level's `this.game`

    if (_.isObject(this.script[this.age])) {
      var scriptEvent = this.script[this.age];
      scriptEvent.a = scriptEvent.a || [];
      scriptEvent.f.apply(this.game, [].concat(scriptEvent.a));

      if (_.isNumber(scriptEvent.r)) {
        this.script[this.age + scriptEvent.r] = scriptEvent;
      }
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
    console.log(that)
  });
}

BreakLevel.prototype = new Level();

BreakLevel.prototype.constructor = BreakLevel;

BreakLevel.prototype.tick = function () {
  this.x += this.deltaX;
  this.y += this.deltaY;
};