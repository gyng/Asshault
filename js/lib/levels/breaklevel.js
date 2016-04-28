function BreakLevel (game, script) {
  script = script || {};
  Level.call(this, script);

  var that = this;
  $('.ui .ready-button').show();
  $('.ui .ready-button').on('click', function () {
    $(this).hide();
    $(".ui .ready-ui").hide();
    that.over = true;
  });
}

BreakLevel.prototype = new Level();

BreakLevel.prototype.constructor = BreakLevel;
