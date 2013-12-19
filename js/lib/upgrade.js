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
        effect: function () { this.shakeReduction *= 0.85; },
        text: {
          name: 'Reinforce Camera Tripod',
          cost: '',
          effect: 'Reduces camera shake.',
          flavour: ''
        }
      }),

    buildTavern:
      new Upgrade({
        name:  'buildTavern',
        effect: function () {
          var tavern = new Tavern(300, 300, this.resources);
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
          var gunner = new Gunner(300, 300, this.resources);
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
          this.friendlies.filter(function (ent) { return ent.constructor === Gunner; }).forEach(function (gunner) {
            gunner.fireRate = Math.ceil(gunner.fireRate * 0.75);
          });

          Gunner.fireRate = Math.ceil(Gunner.fireRate * 0.75);
        },
        constraints: [
          ['heroGunner', 1]
        ],
        text: {
            name: 'Ram Boar Goes Full Auto',
            cost: 'Ram Boar',
            effect: '',
            flavour: 'Always go full auto.'
          }
      }),

    heroSniper:
      new Upgrade({
        name:  'heroSniper',
        effect: function () {
          var sniper = new Sniper(300, 300, this.resources);
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
          flavour: 'They kill foes near them with their distinctive smell.'
        }
      }),
  };
}