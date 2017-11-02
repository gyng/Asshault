function BreakLevel(game, script) {
  script = script || {};
  Level.call(this, game, script);

  var that = this;
  $(".container").addClass("vignette");
  $(".ui .ready-button").show();
  $(".ui .ready-button").on("click", function() {
    $(this).hide();
    $(".container").removeClass("vignette");
    $(".ui .ready-ui").hide();
    that.over = true;
  });
}

BreakLevel.prototype = new Level();

BreakLevel.prototype.constructor = BreakLevel;
