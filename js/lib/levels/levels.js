function Levels(game) { // eslint-disable-line no-unused-vars
  this.levels = {
    1: new BreakLevel(game),
    2: new Level(game, {
      0:  {
        f: function () {
          game.setBackground('res/bg/bggrass.png', 'res/bg/bggrassvig.png');
        }
      },
      45: {
        f: function (wave) {
          game.ui.setLevelInformation('Wave ' + wave);
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
          if (wave % 5 === 0) {
            for (var bosses = wave / 10; bosses > 0; bosses--) {
              game.spawnEnemy(new EnemyShield(game.resources));
            }
          }

          // Normal scrubs
          for (var scrubs = (wave * 2) + 10; scrubs > 0; scrubs--) {
            var enemy;

            var diceRoll = Math.random();
            if (diceRoll < 0.08) {
              enemy = new EnemyTank(game.resources);
            } else if (diceRoll < 0.16) {
              enemy = new EnemyRunner(game.resources);
            } else {
              if (wave > 5 && diceRoll < 0.24) {
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
