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
            game.spawnEnemy(new Enemy(game.resources));
          }
        },
        r: 600
      },
      15: { f: function (arg1) { }, a: 'myarg2' },
    })
  };
}
