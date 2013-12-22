function Upgrade(data) {
  this.name = data.name;
  this.effect = data.effect;
  this.constraints = data.constraints || [];
  this.text = data.text;
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
          this.player.upgrades.push(function () {
            if (this.firing)
              this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x), randomNegation(_.random(10)));
          });
        },
        text: {
          name: 'Jury Rig Ammo Feed',
          cost: '',
          effect: 'More bullets! Un·bullet·able!',
          flavour: ''
        }
      }),

    reduceCameraShake:
      new Upgrade({
        name:  'reduceCameraShake',
        effect: function () { this.renderer.shake.reduction *= 0.85; },
        text: {
          name: 'Reinforce Camera Tripod',
          cost: '',
          effect: 'Reduces camera shake.',
          flavour: ''
        }
      }),

    playerMovement:
      new Upgrade({
        name:  'playerMovement',
        effect: function () {
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
          };

          this.player.game.audio.loop('helicopter2', 0.3, 0.24, 0.83);

          this.player.upgrades.push(function () { this.heloMove(); });
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerMovement', 0, 1]
        ],
        text: {
          name: 'The Flying Machine',
          cost: '',
          effect: 'Move with the WASD keys.',
          flavour: 'Avoid sun.'
        }
      }),

    buildTavern:
      new Upgrade({
        name:  'buildTavern',
        effect: function () {
          var spawnX = this.player.x + randomNegation(_.random(100, 300));
          var spawnY = this.player.y + randomNegation(_.random(100, 300));
          var tavern = new Tavern(this.resources, { x: spawnX, y: spawnY });
          this.entities.push(tavern);
          this.friendlies.push(tavern);
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'buildTavern', 0, 1]
        ],
        text: {
          name: 'A House of Heroes',
          cost: '',
          effect: 'A tavern is constructed in the village. Taverns are known for attracting heroes of all kinds.',
          flavour: 'Beer, ale and whiskey.'
        }
      }),

    heroGunner:
      new Upgrade({
        name:  'heroGunner',
        effect: function () {
          var tavern = _.findWhere(this.entities, { constructor: Tavern });
          var gunner = new Gunner(this.resources, { x: tavern.x, y: tavern.y });
          this.entities.push(gunner);
          this.friendlies.push(gunner);
        },
        constraints: [
          ['buildTavern', 1]
        ],
        text: {
          name: 'A Ram Boar Arrives',
          cost: 'Tavern',
          effect: 'A Ram Boar is a half-gun, half-man, half-ram and half-boar creature.',
          flavour: 'Ram Boars are known to be broke all the time.'
        }
      }),

    gunnerTracking:
      new Upgrade({
        name:  'gunnerTracking',
        effect: function () {
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
          [new UpgradeConstraint('upgradeCountWithinRange'), 'gunnerTracking', 0, 1]
        ],
        text: {
          name: 'Ram Boar Weapons Training',
          cost: 'Ram Boar',
          effect: 'Ram Boars learn to fire ahead of their targets.',
          flavour: 'Who knew Ram Boars didn’t know how to shoot?'
        }
      }),

    gunnerBulletCount:
      new Upgrade({
        name:  'gunnerBulletCount',
        effect: function () {
          _.where(this.friendlies, { constructor: Gunner }).forEach(function (gunner) {
            gunner.fireRate = Math.ceil(gunner.fireRate * 0.75);
          });
        },
        constraints: [
          ['heroGunner', 1]
        ],
        text: {
            name: 'Ram Boar Goes Full Auto',
            cost: 'Ram Boar',
            effect: '25% faster firing for *existing* Ram Boars, up to a limit.',
            flavour: 'Always go full auto.'
          }
      }),

    heroSniper:
      new Upgrade({
        name:  'heroSniper',
        effect: function () {
          var tavern = _.findWhere(this.entities, { constructor: Tavern });
          var sniper = new Sniper(this.resources, { x: tavern.x, y: tavern.y });
          this.entities.push(sniper);
          this.friendlies.push(sniper);
        },
        constraints: [
          ['buildTavern', 1]
        ],
        text: {
          name: 'A Shartshooper Appears',
          cost: 'Tavern',
          effect: 'Shartshoopers are skilled at ranged combat.',
          flavour: 'Nearby foes they kill with their stench.'
        }
      }),

    heroCleaner:
      new Upgrade({
        name:  'heroCleaner',
        effect: function () {
          var tavern = _.findWhere(this.entities, { constructor: Tavern });
          var cleaner = new Cleaner(this.resources, { x: tavern.x, y: tavern.y });
          this.entities.push(cleaner);
          this.friendlies.push(cleaner);
        },
        constraints: [
          ['buildTavern', 1]
        ],
        text: {
          name: 'Tavern Clean Up Crew Member',
          cost: 'Tavern',
          effect: 'No mess too big.',
          flavour: 'Overtime, again?'
        }
      }),
  };
}