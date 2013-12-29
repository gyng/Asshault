function BreakLevel (game, script) {
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