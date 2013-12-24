function Upgrade(data) {
  this.name = data.name;
  this.effect = data.effect;
  this.constraints = data.constraints || [];
  this.text = data.text;
  this.gameUpgradeIcon = data.gameUpgradeIcon;
}

Upgrade.prototype = {
  // Constraints are an array of ['upgradeName', minCount]
  // or [function, args], function (...) { return true/false }
  isConstraintsMet: function (game) {
    var upgradeCount = game.upgradeCount;
    var met = 0;

    this.constraints.forEach(function (req) {
      var constraint, args;

      if (!_.isFunction(req[0])) {
        constraint = new UpgradeConstraint('upgradeCountWithinRange');
        args = [game].concat(req);
      } else if (_.isFunction(req[0])) {
        constraint = req[0];
        args = [game].concat(_.rest(req));
      }

      if (constraint.apply(this, args)) {
        met++;
      }
    }.bind(this));

    return met === this.constraints.length;
  }
};

function UpgradeConstraint(name) {
  this.list = {
    // Upgrade <name> count within [min, max)
    upgradeCountWithinRange: function (game, name, min, max) {
      max = max || Number.MAX_VALUE;
      var upgradeCount = game.upgradeCount[name] || 0;
      return upgradeCount >= min && upgradeCount < max;
    },

    haveGold: function (game, amount) {
      return game.gold >= amount;
    },

    propertyWithinRange: function (game, ent, property, min, max) {
      max = max || Number.MAX_VALUE;
      return ent[property] >= min && ent[property] < max;
    }
  };

  return this.list[name];
}

function Upgrades (game) {
  this.game = game; //
  this.list = {
    increaseBulletCount:
      new Upgrade({
        name:  'increaseBulletCount',
        effect: function () {
          this.subtractGold(15);
          this.player.addUpgrade({
            effect: function () {
              if (this.firing) {
                var fireAt = this.fireAt || Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x);
                this.fire(fireAt, randomNegation(_.random(10)));
              }
            },
            icon: this.sprites.debug,
            tooltip: 'Increased bullet count.'
          });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 15],
        ],
        text: {
          name: 'Jury Rig Ammo Feed',
          cost: '15G',
          effect: 'More bullets! Un·bullet·able!',
          flavour: ''
        }
      }),

    playerPiercingBullets:
      new Upgrade({
        name: 'playerPiercingBullets',
        effect: function () {
          this.player.additionalBulletPierceChance += 0.7;
          this.player.addUpgrade({
            icon: this.sprites.flash2,
            tooltip: 'Piercing bullets.'
          });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 25],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerPiercingBullets', 0, 1]
        ],
        text: {
          name: 'Piercing bullets',
          cost: '25G',
          effect: 'Cut through butter like butter.',
          flavour: ''
        }
      }),

    reduceCameraShake:
      new Upgrade({
        name:  'reduceCameraShake',
        effect: function () {
          this.subtractGold(15);
          this.renderer.shake.reduction *= 0.85;
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 15],
        ],
        text: {
          name: 'Reinforce Camera Tripod',
          cost: '15G',
          effect: 'Reduces camera shake.',
          flavour: ''
        },
        gameUpgradeIcon: {
          icon: game.sprites.flash1,
          tooltip: 'Reduced camera shake.'
        }
      }),

    playerMovement:
      new Upgrade({
        name:  'playerMovement',
        effect: function () {
          this.subtractGold(80);

          keypress.combo("w", function() {
            this.player.heloAccelerate(1, 'y');
          }.bind(this));

          keypress.combo("s", function() {
            this.player.heloAccelerate(-1, 'y');
          }.bind(this));

          keypress.combo("a", function() {
            this.player.heloAccelerate(1, 'x');
          }.bind(this));

          keypress.combo("d", function() {
            this.player.heloAccelerate(-1, 'x');
          }.bind(this));

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

          this.player.heloAccelerate = function (scaling, axis) {
            var closeToEW, closeToNS;

            var deg = rad2deg(this.rotation);

            if (axis === 'x')
              deg = deg - 90;

            if (deg < -180)
                deg = deg + 360;

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

            this.heloXAcceleration += this.accelerationRate * scaling * closeToEW * xFlip;
            this.heloYAcceleration += this.accelerationRate * scaling * closeToNS * yFlip;

            this.heloXAcceleration = Math.max(Math.min(this.heloXAcceleration, this.maxAcceleration), this.minAcceleration);
            this.heloYAcceleration = Math.max(Math.min(this.heloYAcceleration, this.maxAcceleration), this.minAcceleration);

            this.heloXSpeed = Math.max(Math.min(this.heloXSpeed + this.heloXAcceleration, this.maxSpeed), -this.maxSpeed);
            this.heloYSpeed = Math.max(Math.min(this.heloYSpeed + this.heloYAcceleration, this.maxSpeed), -this.maxSpeed);
          };

          this.player.heloMove = function () {
            this.x += this.heloXSpeed;
            this.y += this.heloYSpeed;

            this.heloXSpeed *= this.friction;
            this.heloYSpeed *= this.friction;
            this.heloXAcceleration *= this.friction - 0.025;
            this.heloYAcceleration *= this.friction - 0.025;

            this.drawOffset.x += randomError(1);
            this.drawOffset.y += randomError(1);

            if (hypotenuse(this.heloXSpeed, this.heloYSpeed) > 1 &&
              this.age % 60 === 0) {
              this.game.audio.play('helicopter1', 0.2);
            }
          };

          this.player.game.audio.loop('helicopter2', 0.3, 0.24, 0.83);

          this.player.addUpgrade({
            effect: function () { this.heloMove(); },
            icon: this.sprites.debug2,
            tooltip: 'Ride of the Valkyries.'
          });
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerMovement', 0, 1],
          [new UpgradeConstraint('propertyWithinRange'), this.game.player, 'level', 1],
          [new UpgradeConstraint('haveGold'), 80]
        ],
        text: {
          name: 'The Flying Machine',
          cost: '80G, Player Level 1',
          effect: 'Move with the WASD keys. Too hard to control? Just use W (and only W) like the scrub you are.',
          flavour: 'Avoid sun.'
        }
      }),

    buildTavern:
      new Upgrade({
        name:  'buildTavern',
        effect: function () {
          this.subtractGold(25);
          var spawnX = this.player.x + randomNegation(_.random(100, 300));
          var spawnY = this.player.y + randomNegation(_.random(100, 300));
          var tavern = new Tavern(this.resources, { x: spawnX, y: spawnY });
          this.entities.push(tavern);
          this.friendlies.push(tavern);
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'buildTavern', 0, 1],
          [new UpgradeConstraint('haveGold'), 25]
        ],
        text: {
          name: 'A House of Heroes',
          cost: '25G, No Tavern built',
          effect: 'A tavern is constructed in the village. Taverns are known for attracting heroes of all kinds.',
          flavour: 'Beer, ale and whiskey.'
        },
        gameUpgradeIcon: {
          icon: game.sprites.tavern,
          tooltip: 'Taverns. Places of merriment.'
        }
      }),

    heroGunner:
      new Upgrade({
        name:  'heroGunner',
        effect: function () {
          this.subtractGold(25);
          var tavern = _.findWhere(this.entities, { constructor: Tavern });
          var gunner = new Gunner(this.resources, { x: tavern.x, y: tavern.y });
          this.entities.push(gunner);
          this.friendlies.push(gunner);
        },
        constraints: [
          ['buildTavern', 1],
          [new UpgradeConstraint('haveGold'), 25]
        ],
        text: {
          name: 'A Ram Boar Arrives',
          cost: 'Tavern, 25G',
          effect: 'A Ram Boar is a half-gun, half-man, half-ram and half-boar creature.',
          flavour: 'Ram Boars are known to be broke all the time.'
        }
      }),

    gunnerTracking:
      new Upgrade({
        name:  'gunnerTracking',
        effect: function () {
          this.subtractGold(50);
          var betterFireAt = function (ent) {
            var bulletTravelTime = this.distanceTo(ent) / new Bullet().speed;
            var moveDelta = ent.getMoveDelta(this.game.player.x, this.game.player.y, ent.speed, ent.health / 10);
            this.fire(Math.atan2(this.y - ent.y - bulletTravelTime * moveDelta.y , this.x - ent.x - bulletTravelTime * moveDelta.x));
          };

          this.friendlies.filter(function (ent) { return ent.constructor === Gunner; }).forEach(function (gunner) {
            gunner.fireAt = betterFireAt;
          });

          Gunner.prototype.fireAt = betterFireAt;
        },
        constraints: [
          ['heroGunner', 1],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'gunnerTracking', 0, 1],
          [new UpgradeConstraint('haveGold'), 50]
        ],
        text: {
          name: 'Ram Boar Weapons Training',
          cost: '50G, Ram Boar',
          effect: 'Ram Boars learn to fire ahead of their targets.',
          flavour: 'Who knew Ram Boars didn’t know how to shoot?'
        },
        gameUpgradeIcon: {
          icon: game.sprites.herogunner,
          tooltip: 'Ram Boar weapons training. Ram Boars lead targets when firing.'
        }
      }),

    gunnerBulletCount:
      new Upgrade({
        name:  'gunnerBulletCount',
        effect: function () {
          this.subtractGold(15);
          _.where(this.friendlies, { constructor: Gunner }).forEach(function (gunner) {
            gunner.fireRate = Math.ceil(gunner.fireRate * 0.75);
            gunner.addUpgrade({ icon: game.sprites.debug, tooltip: 'Going fuller auto.' });
          });
        },
        constraints: [
          ['heroGunner', 1],
          [new UpgradeConstraint('haveGold'), 15]
        ],
        text: {
            name: 'Ram Boar Goes Full Auto',
            cost: '15G, Ram Boar',
            effect: '25% faster firing for *existing* Ram Boars, up to a limit.',
            flavour: 'Always go full auto.'
          }
      }),

    heroSniper:
      new Upgrade({
        name:  'heroSniper',
        effect: function () {
          this.subtractGold(50);
          var tavern = _.findWhere(this.entities, { constructor: Tavern });
          var sniper = new Sniper(this.resources, { x: tavern.x, y: tavern.y });
          this.entities.push(sniper);
          this.friendlies.push(sniper);
        },
        constraints: [
          ['buildTavern', 1],
          [new UpgradeConstraint('haveGold'), 50]
        ],
        text: {
          name: 'A Shartshooper Appears',
          cost: '50G, Tavern',
          effect: 'Shartshoopers are skilled at ranged combat.',
          flavour: 'Nearby foes they kill with their stench.'
        }
      }),

    heroCleaner:
      new Upgrade({
        name:  'heroCleaner',
        effect: function () {
          this.subtractGold(10);
          var tavern = _.findWhere(this.entities, { constructor: Tavern });
          var cleaner = new Cleaner(this.resources, { x: tavern.x, y: tavern.y });
          this.entities.push(cleaner);
          this.friendlies.push(cleaner);
        },
        constraints: [
          ['buildTavern', 1],
          [new UpgradeConstraint('haveGold'), 10]
        ],
        text: {
          name: 'Tavern Clean Up Crew Member',
          cost: '10G, Tavern',
          effect: 'No mess too big.',
          flavour: 'Overtime, again?'
        }
      }),
  };
}