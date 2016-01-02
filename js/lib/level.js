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
    // Function is applied with its binding for `this` as this level.
    // First argument is iteration, followed by supplied args.

    if (_.isObject(this.script[this.age])) {
      var scriptEvent = this.script[this.age];
      scriptEvent.a = scriptEvent.a || [];
      var iteration = scriptEvent.iteration || 1;
      scriptEvent.f.apply(this, [iteration].concat(scriptEvent.a));

      if (_.isNumber(scriptEvent.r)) {
        if (_.isNumber(scriptEvent.iteration)) {
          scriptEvent.iteration++;
        } else {
          scriptEvent.iteration = 2;
        }

        this.addEvent(this.age + scriptEvent.r, scriptEvent);
      }
    }

    this.age++;
  },

  draw: function () {
    // noop, to be replaced
  },

  addEvent: function (time, scriptEvent, args) {
    args = args || [];
    this.script[time] = scriptEvent;
  }
};
