/* eslint-disable no-unused-vars */
function Upgrade(data) {
  /* eslint-enable no-unused-vars */
  this.name = data.name;
  this.lame = !!data.lame;
  this.classNames = data.classNames;
  this.important = !!data.important;
  this.effect = data.effect;
  this.constraints = data.constraints || [];
  this.text = data.text;
  this.gameUpgradeIcon = data.gameUpgradeIcon;
}

function UpgradeConstraint(name) {
  this.list = {
    // Upgrade <name> count within [min, max)
    upgradeCountWithinRange: function(game, upgradeName, min, max) {
      var maxUpgrades = max || Number.MAX_VALUE;
      var upgradeCount = game.upgradeCount[upgradeName] || 0;
      return upgradeCount >= min && upgradeCount < maxUpgrades;
    },

    haveGold: function(game, amount) {
      return game.gold >= amount;
    },

    propertyWithinRange: function(game, ent, property, min, max) {
      var maxUpgrades = max || Number.MAX_VALUE;
      return ent[property] >= min && ent[property] < maxUpgrades;
    },

    dynamic: function(game, fn) {
      return fn.apply(game);
    }
  };

  return this.list[name];
}

Upgrade.prototype = {
  // Constraints are an array of ['upgradeName', minCount]
  // or [function, args], function (...) { return true/false }
  isConstraintsMet: function(game) {
    var met = 0;

    this.constraints.forEach(
      function(req) {
        var constraint;
        var args;

        if (!_.isFunction(req[0])) {
          constraint = new UpgradeConstraint("upgradeCountWithinRange");
          args = [game].concat(req);
        } else if (_.isFunction(req[0])) {
          constraint = req[0];
          args = [game].concat(_.rest(req));
        }

        if (constraint.apply(this, args)) {
          met++;
        }
      }.bind(this)
    );

    return met === this.constraints.length;
  }
};

/* eslint-disable no-unused-vars */
function Upgrades(game) {
  /* eslint-enable no-unused-vars */
  this.game = game;
  this.list = {
    increaseBulletCount: new Upgrade({
      name: "increaseBulletCount",
      effect: function() {
        this.subtractGold(
          Math.ceil(
            50 + (game.upgradeCount.increaseBulletCount || 0) * 1.5 * 100
          )
        );

        for (var i = 0; i < (this.player.weapon.streamsPerLevel || 1); i++) {
          this.player.weapon.streams.push({
            offset: _.random(8),
            spread: this.player.weapon.spreadMultiplier
          });
        }

        this.player.addUpgrade({
          icon: this.sprites.debug,
          tooltip: "Increased bullet count."
        });
      },
      constraints: [
        [
          new UpgradeConstraint("dynamic"),
          function() {
            return (
              game.gold >=
              Math.ceil(
                50 + (game.upgradeCount.increaseBulletCount || 0) * 1.5 * 100
              )
            );
          }
        ]
      ],
      text: {
        name: function() {
          return (
            "🔮 Ammo Feed Jury Rig " +
            Util.romanize((game.upgradeCount.increaseBulletCount || 0) + 1)
          );
        },
        cost: function() {
          return (
            Math.ceil(
              50 + (game.upgradeCount.increaseBulletCount || 0) * 1.5 * 100
            ) + "G"
          );
        },
        effect:
          "More bullets! Un·bullet·able! Each consecutive upgrade is more expensive."
      }
    }),

    playerPiercingBullets: new Upgrade({
      name: "playerPiercingBullets",
      effect: function() {
        this.subtractGold(
          Math.ceil(
            400 + (game.upgradeCount.playerPiercingBullets || 0) * 1.5 * 150
          )
        );
        this.player.additionalWeaponPierce += 0.1;
        this.player.addUpgrade({
          icon: this.sprites.flash2,
          tooltip: "Piercing bullets."
        });
      },
      constraints: [
        [
          new UpgradeConstraint("dynamic"),
          function() {
            return (
              game.gold >=
              Math.ceil(
                400 + (game.upgradeCount.playerPiercingBullets || 0) * 1.5 * 150
              )
            );
          }
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerPiercingBullets",
          0,
          10
        ]
      ],
      text: {
        name: function() {
          var names = [
            "Iron",
            "Cobalt",
            "Nickel",
            "Copper",
            "Zinc",
            "Tin",
            "Tungsten",
            "Lead",
            "Polonium",
            "Uranium"
          ];
          var level = game.upgradeCount.playerPiercingBullets || 0;
          return (
            "🔮 Piercing " +
            names[level] +
            " Bullets " +
            Util.romanize(level + 1)
          );
        },
        cost: function() {
          return (
            Math.ceil(
              400 + (game.upgradeCount.playerPiercingBullets || 0) * 1.5 * 150
            ) + "G"
          );
        },
        effect: function() {
          var level = (game.upgradeCount.playerPiercingBullets || 0) + 1;
          return (
            "No better way to cut through butter. Bullets now have " +
            10 * level +
            "% chance to pierce. Max of 10 upgrades. Each consecutive upgrade is more expensive."
          );
        },
        flavour: "Shot through the heart. Who’s to blame?"
      }
    }),

    reduceCameraShake: new Upgrade({
      name: "reduceCameraShake",
      lame: true,
      effect: function() {
        this.subtractGold(100);
        this.renderer.shake.reduction *= 0.75;
      },
      constraints: [[new UpgradeConstraint("haveGold"), 100]],
      text: {
        name: "🎥 Reinforce Camera Tripod",
        cost: "100G",
        effect: "Reduces camera shake."
      },
      gameUpgradeIcon: {
        icon: game.sprites.flash1,
        tooltip: "Reduced camera shake."
      }
    }),

    playerFlyingMovement: new Upgrade({
      name: "playerFlyingMovement",
      effect: function() {
        this.subtractGold(80);

        keypress.combo(
          "w",
          function() {
            this.player.heloAccelerate(1, "y");
          }.bind(this)
        );

        keypress.combo(
          "s",
          function() {
            this.player.heloAccelerate(-1, "y");
          }.bind(this)
        );

        keypress.combo(
          "a",
          function() {
            this.player.heloAccelerate(1, "x");
          }.bind(this)
        );

        keypress.combo(
          "d",
          function() {
            this.player.heloAccelerate(-1, "x");
          }.bind(this)
        );

        this.player.heloXSpeed = 0;
        this.player.heloYSpeed = 0;
        this.player.heloXAcceleration = 0;
        this.player.heloYAcceleration = 0;
        this.player.acceleration = 0;
        this.player.accelerationRate = 0.25;
        this.player.maxAcceleration = 0.5;
        this.player.minAcceleration = -0.5;
        this.player.maxSpeed = 5;
        this.player.friction = 0.985;

        this.player.shadow.offset.y += 75;
        this.player.shadow.size.x *= 1.5;
        this.player.shadow.size.y *= 1.5;
        this.player.shadow.color = "rgba(0, 0, 0, 0.15)";

        this.player.heloAccelerate = function(scaling, axis) {
          var closeToEW;
          var closeToNS;

          var deg = Util.rad2deg(this.rotation);

          if (axis === "x") {
            deg -= 90;
          }

          if (deg < -180) {
            deg += 360;
          }

          closeToNS = Math.abs((90 - Math.abs(deg)) / 90);
          closeToEW = 1 - closeToNS;

          var yFlip = 1;
          var xFlip = 1;

          if (deg >= -180 && deg <= -90) {
            xFlip = -1;
          } else if (deg > -90 && deg <= 0) {
            xFlip = -1;
            yFlip = -1;
          } else if (deg > 0 && deg < 90) {
            yFlip = -1;
          }

          this.heloXAcceleration +=
            this.accelerationRate * scaling * closeToEW * xFlip;
          this.heloYAcceleration +=
            this.accelerationRate * scaling * closeToNS * yFlip;

          this.heloXAcceleration = Util.clamp(
            this.heloXAcceleration,
            this.minAcceleration,
            this.maxAcceleration
          );
          this.heloYAcceleration = Util.clamp(
            this.heloYAcceleration,
            this.minAcceleration,
            this.maxAcceleration
          );

          this.heloXSpeed = Util.clamp(
            this.heloXSpeed + this.heloXAcceleration,
            -this.maxSpeed,
            this.maxSpeed
          );
          this.heloYSpeed = Util.clamp(
            this.heloYSpeed + this.heloYAcceleration,
            -this.maxSpeed,
            this.maxSpeed
          );
        };

        this.player.heloMove = function() {
          this.x += this.heloXSpeed;
          this.y += this.heloYSpeed;

          this.heloXSpeed *= this.friction;
          this.heloYSpeed *= this.friction;
          this.heloXAcceleration *= this.friction - 0.025;
          this.heloYAcceleration *= this.friction - 0.025;

          this.drawOffset.x += Util.randomError(1);
          this.drawOffset.y += Util.randomError(1);

          if (
            Util.hypotenuse(this.heloXSpeed, this.heloYSpeed) > 1 &&
            this.age % 60 === 0
          ) {
            this.game.audio.play("helicopter1", 0.2);
          }
        };

        this.player.game.audio.loop("helicopter2", 0.3, 0.24, 0.83);

        this.player.addUpgrade({
          effect: function() {
            this.heloMove();
          },
          icon: this.sprites.debug2,
          tooltip: "Ride of the Valkyries."
        });
      },
      constraints: [
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerFlyingMovement",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerWalkingMovement",
          0,
          1
        ],
        [
          new UpgradeConstraint("propertyWithinRange"),
          this.game.player,
          "level",
          1
        ],
        [new UpgradeConstraint("haveGold"), 80]
      ],
      text: {
        name: "🚶 The Flying Machine",
        cost: "80G, Player Level 1",
        effect:
          "Are you a legit flyboy? Move with the WASD keys. (Harder to control, but faster than walking)",
        flavour: "Avoid sun."
      }
    }),

    playerDash: new Upgrade({
      name: "playerDash",
      important: true,
      classNames: ["upgrade-highlight"],
      effect: function() {
        this.subtractGold(400);
        var blinkCooldown = 480;
        var blinkDistance = 180;
        var blinkSteps = 4;
        this.player.blinkCooldown = 0;
        this.player.blinkStep = blinkSteps;
        this.player.game.audio.play("yell2");

        window.addEventListener(
          "keydown",
          function(event) {
            switch (event.keyCode) {
              case 69: // E
                if (this.blinkCooldown <= 0) {
                  this.blinkOffsetPos = Util.offsetPosition(
                    this.rotation,
                    blinkDistance
                  );
                  this.blinkCooldown = blinkCooldown;
                  this.blinkStep = blinkSteps;
                }
                break;
              default:
                break;
            }
          }.bind(this.player),
          false
        );

        var drawHat = function(context) {
          context.drawImage(this.sprites.flame, -50, -30);
          context.drawImage(this.sprites.flame, 35, -30);
        }.bind(this);
        var drawNothing = function() {};

        var hat = {
          draw: drawHat
        };

        this.player.hats.push(hat);

        this.player.addUpgrade({
          effect: function() {
            this.blinkCooldown -= 1;

            if (this.blinkOffsetPos && this.blinkStep > 0) {
              this.x += this.blinkOffsetPos.x / blinkSteps;
              this.y += this.blinkOffsetPos.y / blinkSteps;
              this.blinkStep -= 1;
            }

            if (this.blinkCooldown === 0) {
              this.game.audio.play("yell2");
            }

            hat.draw = this.blinkCooldown <= 0 ? drawHat : drawNothing;
          }.bind(this.player),
          icon: this.sprites.debug2,
          tooltip: "Quick and nimble."
        });
      },
      constraints: [
        [new UpgradeConstraint("haveGold"), 400],
        [new UpgradeConstraint("upgradeCountWithinRange"), "playerDash", 0, 1]
      ],
      text: {
        name: "🚶 Dash",
        cost: "400G, Player Level 1",
        effect:
          "Press E for a dash of speed in the direction you’re looking at every 7 seconds.",
        flavour: "Can’t touch this!"
      }
    }),

    playerWalkingMovement: new Upgrade({
      name: "playerWalkingMovement",
      important: true,
      effect: function() {
        this.subtractGold(10);

        this.player.keyW = false;
        this.player.keyA = false;
        this.player.keyS = false;
        this.player.keyD = false;
        this.player.moveDeltaX = 0;
        this.player.moveDeltaY = 0;
        var moveSpeed = 3;

        window.addEventListener(
          "keydown",
          function(event) {
            switch (event.keyCode) {
              case 68:
                this.keyD = true;
                break;
              case 83:
                this.keyS = true;
                break;
              case 65:
                this.keyA = true;
                break;
              case 87:
                this.keyW = true;
                break;
              default:
                /*  noop */ break;
            }
          }.bind(this.player),
          false
        );

        window.addEventListener(
          "keyup",
          function(event) {
            switch (event.keyCode) {
              case 68:
                this.keyD = false;
                break;
              case 83:
                this.keyS = false;
                break;
              case 65:
                this.keyA = false;
                break;
              case 87:
                this.keyW = false;
                break;
              default:
                /*  noop */ break;
            }
          }.bind(this.player),
          false
        );

        this.player.walk = function() {
          var actualMoveSpeed = moveSpeed;
          if (
            (this.keyW && this.keyA) ||
            (this.keyW && this.keyD) ||
            (this.keyA && this.keyS) ||
            (this.keyS && this.keyD)
          ) {
            actualMoveSpeed = Math.sqrt(moveSpeed * moveSpeed / 2);
          }

          if (this.keyW) {
            this.moveDeltaY = -actualMoveSpeed;
          }
          if (this.keyS) {
            this.moveDeltaY = actualMoveSpeed;
          }
          if (this.keyA) {
            this.moveDeltaX = -actualMoveSpeed;
          }
          if (this.keyD) {
            this.moveDeltaX = actualMoveSpeed;
          }

          this.x += this.moveDeltaX;
          this.y += this.moveDeltaY;

          this.moveDeltaX *= 0.9;
          this.moveDeltaY *= 0.9;
          this.drawOffset.y *= 0.9;
          this.drawOffset.scaleX += (1 - this.drawOffset.scaleX) * 0.1;
          this.drawOffset.scaleY += (1 - this.drawOffset.scaleY) * 0.1;

          var moveIntensity = Math.sqrt(
            this.moveDeltaX * this.moveDeltaX +
              this.moveDeltaY * this.moveDeltaY
          );
          if (this.age % 15 === 0 && moveIntensity > 0.5) {
            this.drawOffset.y += 7 + _.random(3);
            this.drawOffset.scaleX = 1.05;
            this.drawOffset.scaleY = 0.9;
            this.game.audio.play(
              "walk" + (_.random(2) + 1),
              0.2 * moveIntensity
            );

            this.game.renderer.drawDecal(
              this.sprites.explosion1,
              this.x + this.width / 2,
              this.y + this.height / 2,
              Util.randomRad(),
              10,
              10
            );

            this.game.renderer.drawFadingDecal(
              this.sprites.explosion1,
              this.x + Util.randomError(24),
              this.y + Util.randomError(24),
              Util.randomRad(),
              50 + Util.randomError(20),
              50 + Util.randomError(20)
            );
          }
        };

        this.player.addUpgrade({
          effect: function() {
            this.walk();
          },
          icon: this.sprites.debug2,
          tooltip: "Perambulator ambulator."
        });
      },
      constraints: [
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerWalkingMovement",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerFlyingMovement",
          0,
          1
        ],
        [new UpgradeConstraint("haveGold"), 10]
      ],
      text: {
        name: "🚶 The Walking Machine",
        cost: "10G, Player Level 1",
        effect: "Fear flying? Walk! Slowly. Move with the WASD keys.",
        flavour: "Ambulate in your new perambulator.",
        highlight: true
      }
    }),

    buildTavern: new Upgrade({
      name: "buildTavern",
      important: true,
      effect: function() {
        this.subtractGold(50);
        var spawnX = this.player.x + Util.randomNegation(_.random(100, 300));
        var spawnY = this.player.y + Util.randomNegation(_.random(100, 300));
        var tavern = new Tavern(this.resources, { x: spawnX, y: spawnY });
        this.entities.push(tavern);
        this.friendlies.push(tavern);
      },
      constraints: [
        [new UpgradeConstraint("upgradeCountWithinRange"), "buildTavern", 0, 1],
        [new UpgradeConstraint("haveGold"), 50]
      ],
      text: {
        name: "🍺 A House of Heroes",
        cost: "50G, No Tavern built",
        effect:
          "Taverns are known for attracting heroes of all kinds. " +
          "Hire heroes for a small stipend. Heroes use gold to reload and are taxed 25% of their remaining gold at the end of each wave.",
        flavour: "Beer, ale and whiskey."
      },
      gameUpgradeIcon: {
        icon: game.sprites.tavern,
        tooltip: "Taverns. Places of merriment."
      }
    }),

    heroGunner: new Upgrade({
      name: "heroGunner",
      effect: function() {
        this.subtractGold(100);
        var tavern = _.findWhere(this.entities, { constructor: Tavern });
        var gunner = new Gunner(this.resources, { x: tavern.x, y: tavern.y });
        this.entities.push(gunner);
        this.friendlies.push(gunner);
      },
      constraints: [
        ["buildTavern", 1],
        [new UpgradeConstraint("haveGold"), 100]
      ],
      text: {
        name: "🐷 A Ram Boar Arrives",
        cost: "Tavern, 100G",
        effect:
          "A Ram Boar is a half-gun, half-man, half-ram and half-boar creature. 15G/reload.",
        flavour: "Ram Boars are known to be broke all the time."
      }
    }),

    gunnerTracking: new Upgrade({
      name: "gunnerTracking",
      effect: function() {
        this.subtractGold(400);
        var betterFireAt = function(ent) {
          this.checkBullets(15);
          var bulletTravelTime = this.distanceTo(ent) / this.weapon.bulletSpeed;
          var moveDelta = ent.getMoveDelta(
            this.game.player.x,
            this.game.player.y,
            ent.speed,
            ent.health / 10
          );
          this.weapon.fire(
            Math.atan2(
              this.y - ent.y - bulletTravelTime * moveDelta.y,
              this.x - ent.x - bulletTravelTime * moveDelta.x
            )
          );
        };

        this.friendlies
          .filter(function(ent) {
            return ent.constructor === Gunner;
          })
          .forEach(function(gunner) {
            gunner.fireAt = betterFireAt;
          });

        Gunner.prototype.fireAt = betterFireAt;
      },
      constraints: [
        ["heroGunner", 1],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "gunnerTracking",
          0,
          1
        ],
        [new UpgradeConstraint("haveGold"), 400]
      ],
      text: {
        name: "🐷 Ram Boar Weapons Training",
        cost: "400G, Ram Boar",
        effect: "Ram Boars learn to fire ahead of their targets.",
        flavour: "Who knew Ram Boars didn’t know how to shoot?"
      },
      gameUpgradeIcon: {
        icon: game.sprites.herogunner,
        tooltip:
          "Ram Boar weapons training. Ram Boars lead targets when firing."
      }
    }),

    gunnerBulletCount: new Upgrade({
      name: "gunnerBulletCount",
      effect: function() {
        this.subtractGold(
          100 *
            game.friendlies.filter(function(ent) {
              return ent.constructor === Gunner;
            }).length
        );
        _.where(this.friendlies, { constructor: Gunner }).forEach(function(
          gunner
        ) {
          gunner.weapon.fireRate = Math.ceil(gunner.weapon.fireRate * 0.75);
          gunner.addUpgrade({
            icon: game.sprites.debug,
            tooltip: "Going fuller auto."
          });
        });
      },

      constraints: [
        ["heroGunner", 1],
        [
          new UpgradeConstraint("dynamic"),
          function() {
            return (
              game.gold >=
              100 *
                game.friendlies.filter(function(ent) {
                  return ent.constructor === Gunner;
                }).length
            );
          }
        ]
      ],
      text: {
        name: "🐷 Ram Boar Goes Full Auto",
        cost: function() {
          return (
            "100G/Ram Boar (" +
            100 *
              game.friendlies.filter(function(ent) {
                return ent.constructor === Gunner;
              }).length +
            "G)"
          );
        },
        effect: "25% faster firing for *existing* Ram Boars, up to a limit.",
        flavour: "Always go full auto."
      }
    }),

    heroSniper: new Upgrade({
      name: "heroSniper",
      effect: function() {
        this.subtractGold(150);
        var tavern = _.findWhere(this.entities, { constructor: Tavern });
        var sniper = new Sniper(this.resources, { x: tavern.x, y: tavern.y });
        this.entities.push(sniper);
        this.friendlies.push(sniper);
      },
      constraints: [
        ["buildTavern", 1],
        [new UpgradeConstraint("haveGold"), 150]
      ],
      text: {
        name: "🦉 A Shartshooper Appears",
        cost: "150G, Tavern",
        effect: "Shartshoopers are skilled at ranged combat. 25G/reload.",
        flavour: "Nearby foes they kill with their stench."
      }
    }),

    heroCleaner: new Upgrade({
      name: "heroCleaner",
      effect: function() {
        this.subtractGold(10);
        var tavern = _.findWhere(this.entities, { constructor: Tavern });
        var cleaner = new Cleaner(this.resources, { x: tavern.x, y: tavern.y });
        this.entities.push(cleaner);
        this.friendlies.push(cleaner);
      },
      constraints: [
        ["buildTavern", 1],
        [new UpgradeConstraint("haveGold"), 10]
      ],
      text: {
        name: "🐵 Tavern Clean Up Crew Member",
        cost: "10G, Tavern",
        effect: "No mess too big.",
        flavour: "No salary too small."
      }
    }),

    playerPointDefenseDrone: new Upgrade({
      name: "playerPointDefenseDrone",
      effect: function() {
        this.subtractGold(
          Math.ceil(
            50 + (game.upgradeCount.playerPointDefenseDrone || 0) * 1.2 * 50
          )
        );
        var pdd = new PointDefenseDrone(this.resources, {
          x: this.player.x,
          y: this.player.y,
          rad: _.random(360)
        });
        this.entities.push(pdd);
        this.friendlies.push(pdd);
        this.player.addUpgrade({
          icon: this.sprites.flash1,
          tooltip: "Point defense drone."
        });
      },
      constraints: [
        [
          new UpgradeConstraint("dynamic"),
          function() {
            return (
              game.gold >=
              Math.ceil(
                50 + (game.upgradeCount.playerPointDefenseDrone || 0) * 1.2 * 50
              )
            );
          }
        ]
      ],
      text: {
        name: "💿 Point Defense Drone",
        cost: function() {
          return (
            Math.ceil(
              50 + (game.upgradeCount.playerPointDefenseDrone || 0) * 1.2 * 50
            ) + "G"
          );
        },
        effect:
          "Zaps nearby foes. Cost increases with number of drones bought.",
        flavour:
          "A field of absolute terror. For when your friends intrude on your absolute territory."
      }
    }),

    pointDefenseDroneBulletHell: new Upgrade({
      name: "pointDefenseDroneBulletHell",
      effect: function() {
        this.subtractGold(400);
        var sprites = this.sprites;

        var bulletHellTick = function() {
          var rad = Util.deg2rad(this.age % 360) * this.angularVelocity;
          var pos = Util.aheadPosition(
            this.game.player.x,
            this.game.player.y,
            rad,
            this.orbitRadius
          );
          this.x = pos.x;
          this.y = pos.y;
          this.rotation = rad;
          this.weapon.bulletLifespan = 360;
          this.weapon.bulletSpeed = 10;
          this.weapon.bulletSpeedVariance = 10;
          this.weapon.damage = 3;
          this.weapon.spread = Util.deg2rad(15);
          this.weapon.bulletSprite = sprites.energyball;
          this.weapon.flashSprite = sprites.aFlame;

          if (this.age % (10 + _.random(3)) === 0) {
            this.weapon.fire(
              Math.atan2(
                this.game.player.y - this.y,
                this.game.player.x - this.x
              )
            );
          }
        };

        this.friendlies
          .filter(function(ent) {
            return ent.constructor === PointDefenseDrone;
          })
          .forEach(function(pdd) {
            pdd.tick = bulletHellTick;
          });

        PointDefenseDrone.prototype.tick = bulletHellTick;
      },
      constraints: [
        [new UpgradeConstraint("haveGold"), 400],
        ["playerPointDefenseDrone", 1],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "pointDefenseDroneBulletHell",
          0,
          1
        ]
      ],
      text: {
        name: "💿 Point Defence Drone Bullet Hell",
        cost: "400G",
        effect: "Bullet hell.",
        flavour: "wich pdd wud u get hit by"
      },
      gameUpgradeIcon: {
        icon: game.sprites.debug2,
        tooltip: "Point defense drone bullet hell."
      }
    }),

    playerShotgunWeapon: new Upgrade({
      name: "playerShotgunWeapon",
      effect: function() {
        this.subtractGold(100);

        this.player.weapon.applyOverrides({
          spreadMultiplier: 0.5,
          damage: 0.55,
          fireRate: 40,
          recoilOffset: 3,
          recoilCameraShake: 3,
          bulletSpeed: 30,
          bulletSpeedVariance: 20,
          streamsPerLevel: 4,
          sprite: this.sprites.gun2,
          bulletSprite: this.sprites.bullettear2
        });

        for (var i = 0; i < 20; i++) {
          this.player.weapon.streams.push({ offset: _.random(20), spread: 20 });
        }

        this.player.addUpgrade({
          icon: this.sprites.flash2,
          tooltip: "An expert at riding shotgun, and firing one, too."
        });
      },
      constraints: [
        [new UpgradeConstraint("haveGold"), 100],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerShotgunWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerBeamWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerFireWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerRicochetWeapon",
          0,
          1
        ]
      ],
      text: {
        name: "🔫 Shotgun",
        cost: "100G",
        effect:
          "Become a disciple of the shotgun. Disables other weapon paths.",
        flavour: "Certified lethal."
      }
    }),

    playerBeamWeapon: new Upgrade({
      name: "playerBeamWeapon",
      effect: function() {
        this.subtractGold(100);

        this.player.weapon.applyOverrides({
          spreadMultiplier: 0.15,
          offsetMultiplier: 0.15,
          damage: 0.1,
          fireRate: 0,
          recoilOffset: 0.3,
          recoilCameraShake: 0.5,
          bulletSprite: this.sprites.aBeam0,
          bulletAnimationLength: 20,
          bulletAnimationLengthVariance: 3,
          bulletFade: true,
          sprite: this.sprites.magicwand,
          bulletPingSprite: this.sprites.aSparksPink,
          flashSprite: this.sprites.aFlash1,
          flashOpacity: 0.1
        });

        this.player.weapon.sounds.beam = ["zap"];

        this.player.weapon.beforeFire = function() {
          var multiplier = 1 + Util.clamp(this.parent.stillFor / 10, 0, 5);
          this.multiplier = multiplier;
          this.damage = 0.1 * multiplier;
          this.offsetMultiplier = 0.15 * multiplier;
          this.bulletAnimationLength = 80 / multiplier;
          this.bulletScale = 1 + multiplier / 2;
          this.flashScale = multiplier / 3;
          this.recoilCameraShake = 0.5 * multiplier / 3;

          if (multiplier >= 5) {
            this.sounds.beam = ["zap", "zap2", "zap3", "zap4", "zap5"];
          } else if (multiplier >= 4) {
            this.sounds.beam = ["zap", "zap2", "zap3", "zap4"];
          } else if (multiplier >= 3) {
            this.sounds.beam = ["zap", "zap2", "zap3"];
          } else if (multiplier >= 2) {
            this.sounds.beam = ["zap", "zap2"];
          } else {
            this.sounds.beam = "zap";
          }
        }.bind(this.player.weapon);

        this.player.weapon.fireSound = function() {
          if (Math.random() > 0.025) {
            this.game.audio.play(
              this.sounds.beam,
              Util.clamp(
                0.05 * this.streams.length * (this.multiplier || 1),
                0.2,
                1.5
              )
            );
          }
        };

        this.player.addUpgrade({
          icon: this.sprites.flash2,
          tooltip: "Nearly as good as SLB."
        });
      },
      constraints: [
        [new UpgradeConstraint("haveGold"), 100],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerBeamWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerShotgunWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerFireWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerRicochetWeapon",
          0,
          1
        ]
      ],
      text: {
        name: "🔫 Moonlight Breaker",
        cost: "100G",
        effect:
          "Develop a loving for radiation. Beam weapon that deals up to 5× damage if you stay still. Disables other weapon paths.",
        flavour: "Second degree sunlight."
      }
    }),

    playerFireWeapon: new Upgrade({
      name: "playerFireWeapon",
      effect: function() {
        this.subtractGold(100);

        this.player.weapon.applyOverrides({
          spreadMultiplier: 1.5,
          offsetMultiplier: 1.5,
          damage: 0.35,
          fireRate: 2,
          recoilOffset: 0.3,
          recoilCameraShake: 0.5,
          bulletLifespan: 30,
          bulletSpeed: 5,
          bulletSpeedVariance: 2,
          bulletLifespanVariance: 10,
          bulletSprite: this.sprites.aBullet1,
          bulletWidth: 30,
          bulletHeight: 30,
          bulletLightRadiusScale: 2,
          bulletSizeWobbleVariance: 10,
          bulletShadow: true,
          bulletFade: true,
          bulletPingSprite: this.sprites.aFlame,
          bulletPingSounds: { spawn: ["hit_hurt3", "hit_hurt5"] },
          sprite: this.sprites.gun3,
          flashFade: true,
          flashSprite: this.sprites.aFlame,
          flashLightRadiusScale: 2,
          flashVariance: 100
        });

        this.player.weapon.streams.push({ offset: _.random(24), spread: 28 });

        this.player.weapon.sounds.flame = ["flame", "flame2"];

        this.player.weapon.fireSound = function() {
          if (Math.random() > 0.02) {
            this.game.audio.play(
              this.sounds.flame,
              Util.clamp(0.1 * this.streams.length, 0.1, 1)
            );
          }
        };

        this.player.addUpgrade({
          icon: this.sprites.flash2,
          tooltip: "Fire! Fire! Fire!"
        });
      },
      constraints: [
        [new UpgradeConstraint("haveGold"), 100],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerBeamWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerShotgunWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerFireWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerRicochetWeapon",
          0,
          1
        ]
      ],
      text: {
        name: "🔫 Flamethrower",
        cost: "100G",
        effect: "🔥🔥🔥 (Disables other weapon paths.)",
        flavour: "🔥🔥🔥"
      }
    }),

    playerRicochetWeapon: new Upgrade({
      name: "playerRicochetWeapon",
      effect: function() {
        this.subtractGold(100);

        this.player.weapon.applyOverrides({
          spreadMultiplier: 0.5,
          damage: 20,
          fireRate: 40,
          recoilOffset: 3,
          recoilCameraShake: 3,
          bulletSpeed: 30,
          bulletSpeedVariance: 10,
          streamsPerLevel: 1,
          bulletSprite: this.sprites.bullettear
        });

        this.player.weapon.bullet = function(radians, offset) {
          return new BulletRicochet(this.parent.resources, {
            x: this.parent.x,
            y: this.parent.y,
            direction: radians + offset,
            rotation: radians + offset,
            damage: this.damage,
            speed: this.bulletSpeed + _.random(this.bulletSpeedVariance),
            source: this.parent.deferSource || this.parent,
            additionalPierceChance:
              this.pierce + (this.parent.additionalWeaponPierce || 0),
            lifespan:
              this.bulletLifespan + _.random(this.bulletLifespanVariance),
            sprite: this.bulletSprite,
            width: this.bulletWidth,
            height: this.bulletHeight
          });
        };

        this.player.addUpgrade({
          icon: this.sprites.flash2,
          tooltip: "A cute weapon for acute situations"
        });
      },
      constraints: [
        [new UpgradeConstraint("haveGold"), 100],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerShotgunWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerBeamWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerFireWeapon",
          0,
          1
        ],
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "playerRicochetWeapon",
          0,
          1
        ]
      ],
      text: {
        name: "🔫 Flak Cannon",
        cost: "100G",
        effect:
          "A cute weapon for acute situations. Disables other weapon paths",
        flavour: "The machine that goes ping, and pong, and peng."
      }
    }),

    enhancedSenses: new Upgrade({
      name: "enhancedSenses",
      lame: true,
      effect: function() {
        this.subtractGold(1000);
        game.renderer.context.clearRect(
          0,
          0,
          game.canvas.width,
          game.canvas.height
        );
        game.renderer.canvas = game.renderer.fadeCanvas;
        game.renderer.context = game.renderer.fadeContext;
        game.renderer.fadeContext.fillStyle = "rgba(0, 0, 0, 0.03)";
        game.renderer.clearContext = false;
        game.player.speed += 1;
        game.setBackground("", "", "grey");
        $("#fade-canvas").css("mix-blend-mode", "difference");
      },
      constraints: [
        [
          new UpgradeConstraint("upgradeCountWithinRange"),
          "enhancedSenses",
          0,
          1
        ],
        [new UpgradeConstraint("haveGold"), 1000]
      ],
      text: {
        name: "🙈 Go Blind",
        cost: "1000G",
        effect:
          "Force yourself to master the art of awareness. Be one with everything (and move slightly faster)!",
        flavour:
          "No, this does not give you all the upgrades. Side effects may include hair loss and blindness."
      }
    })
  };
}
