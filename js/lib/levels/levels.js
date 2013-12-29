function Levels (game) {
  this.levels = {
    1: new BreakLevel(game),
    2: new Level(game, {
      0:  {
        f: function () {
          game.setBackground('res/bg/bggrass.png', 'res/bg/bggrassvig.png');
        }
      },
      45: {
        f: function () {
          var spawn = {};
          var minDistanceAway = 200;
          var maxAttempts = 100;
          var attempts = 0;

          do
            spawn = { x: _.random(game.canvas.width), y: _.random(game.canvas.height) };
          while (
            Util.distanceBetween(spawn, game.player) < minDistanceAway &&
            attempts++ < maxAttempts);

          if (attempts < maxAttempts)
            game.addEntity(new Enemy(game.resources, spawn), 'enemy');
        },
        r: 45
      },
      15: { f: function (arg1) { }, a: 'myarg2' },
    })
  };
}