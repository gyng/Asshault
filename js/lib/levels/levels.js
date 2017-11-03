/* eslint-disable no-unused-vars */
var colours = [
  ["rgba(255, 255, 255, 0)", 0.33],
  ["rgba(255, 255, 255, 0)", 0.1],
  ["rgba(255, 255, 255, 0)", 0.1],
  ["rgba(255, 255, 255, 0)", 0.1],
  ["rgba(255, 255, 255, 0)", 0.1],
  ["rgba(255, 255, 255, 0)", 0.1],
  ["rgba(255, 255, 255, 0)", 0.1],
  ["rgba(255, 255, 255, 0)", 0.1],
  ["rgba(255, 255, 255, 0)", 0.33],
  ["rgba(255, 255, 255, 0)", 0.66],
  ["rgba(255, 234, 106, 0)", 1],
  ["rgba(255, 213, 55, 0)", 1],
  ["rgba(34, 118, 192, 0)", 1],
  ["rgba(0, 144, 251, 0)", 1],
  ["rgba(0, 97, 184, 0)", 1],
  ["rgba(0, 72, 123, 0)", 1],
  ["rgba(0, 55, 100, 0)", 1],
  ["rgba(0, 72, 123, 0)", 1],
  ["rgba(0, 97, 184, 0)", 1],
  ["rgba(0, 144, 251, 0)", 1],
  ["rgba(34, 118, 192, 0)", 1],
  ["rgba(255, 213, 55, 0)", 1],
  ["rgba(255, 234, 106, 0)", 1],
  ["rgba(255, 255, 255, 0)", 0.66]
];

function setDayColour(game, wave) {
  game.renderer.ambientLightColor = colours[wave % colours.length][0];
  game.renderer.environmentLightColor = colours[
    wave % colours.length
  ][0].replace("0)", "1)");
  game.ui.lightingCanvas.style.opacity = "" + colours[wave % colours.length][1];
}

function Levels(game) {
  /* eslint-enable no-unused-vars */
  this.levels = {
    1: new BreakLevel(game, {
      0: {
        f: function() {
          game.player.say("I must prepare.");
        }
      },
      700: {
        f: function() {
          game.player.say("They lurk…");
        }
      }
    }),
    2: new Level(game, {
      0: {
        f: function() {
          game.timeOfDay = -1800;
          game.dayLength = 600 * 24;
          game.player.say("Stale air…", 1500);
          game.setBackground(
            "res/bg/bggrass.png",
            "res/bg/bggrassvig.png",
            "#3D5025"
          );
        }
      },
      45: {
        f: function(wave) {
          game.ui.setLevelInformation("Wave " + wave);
          game.audio.play("bell", 1.0);

          if (wave % 24 === 12) {
            game.player.say("Night falls…", 1500);
          }

          setDayColour(game, wave);

          // Salary and taxes
          game.friendlies.forEach(function(e) {
            if (e.salary) {
              var initial = e.gold;

              game.addGold(-e.salary * Math.ceil(e.level / 3));

              var tax = Math.floor(e.gold * e.taxRate);
              e.addGold(-tax);
              game.addGold(tax);

              var change = initial - e.gold;

              if (change < 0) {
                game.audio.play("coin3", 0.5);
                e.popup(-change, 650, "#template-gold-popup");
              } else {
                game.audio.play("coin2", 0.5);
                e.popup("+" + change, 650, "#template-tax-popup");
              }
            }
          });

          if (wave % 5 === 0) {
            // Boss!
            for (var bosses = wave / 10; bosses > 0; bosses--) {
              var boss = new EnemyShield(game.resources);
              boss.health *= wave / 5;
              boss.startingHealth = boss.health;
              game.spawnEnemy(boss);
            }

            if (wave >= 15) {
              for (var spawners = wave / 10; spawners > 0; spawners--) {
                game.spawnEnemy(new EnemySpawner(game.resources));
              }
            }
          } else {
            // Normal scrubs
            for (var scrubs = wave * 2 + 10; scrubs > 0; scrubs--) {
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
          }
        },
        r: 600
      }
    })
  };
}
