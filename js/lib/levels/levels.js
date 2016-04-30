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

          // Salary and taxes
          game.friendlies.forEach(function (e) {
            if (e.salary) {
              var initial = e.gold;

              game.addGold(-e.salary * Math.ceil(e.level / 3));

              var tax = Math.floor(e.gold * e.taxRate);
              e.addGold(-tax);
              game.addGold(tax);

              var change = initial - e.gold;

              if (change < 0) {
                game.audio.play('coin3', 0.5);
                e.popup(-change, 650, '#template-gold-popup');
              } else {
                game.audio.play('coin2', 0.5);
                e.popup('+' + change, 650, '#template-tax-popup');
              }
            }
          });

          // Boss!
          if (i % 5 == 0) {
            for (var j = i / 10; j > 0; j--) {
              game.spawnEnemy(new EnemyShield(game.resources));
            }
          }

          // Normal scrubs
          for (var j = (i * 2) + 10; j > 0; j--) {
            var overrides = {};
            var enemy;

            var diceRoll = Math.random();
            if (diceRoll < 0.08) {
              enemy = new EnemyTank(game.resources);
            } else if (diceRoll < 0.16) {
              enemy = new EnemyRunner(game.resources);
            } else {
              if (i > 5 && diceRoll < 0.24) {
                game.spawnEnemy(new EnemyCamper(game.resources));
              }

              enemy = new Enemy(game.resources);
            }

            game.spawnEnemy(enemy);
          }
        },
        r: 600
      }
    })
  };
}
