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
        f: function (i) {
          game.ui.setLevelInformation('Wave ' + i);
          game.audio.play('bell', 1.0);

          for (var j = i + 10; j > 0; j--) {
            var overrides = {};
            var enemy;

            if (Math.random() < 0.08) {
              // Big Boss!
              var sizeVariance = _.random(24);
              overrides = {
                sprite: game.sprites.debug3,
                width: 48 + sizeVariance,
                height: 48 + sizeVariance,
                speed: 0.9 - Math.min(0.7, sizeVariance / 48),
                health: 10 + sizeVariance
              };

              enemy = new EnemyTank(game.resources, overrides);
            } else {
              enemy = new Enemy(game.resources);
            }

            game.spawnEnemy(enemy);
          }
        },
        r: 600
      },
      15: { f: function (arg1) { }, a: 'myarg2' },
    })
  };
}
