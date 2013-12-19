function Upgrade(name, effect, constraints) {
  this.name = name;
  this.effect = effect;
  this.constraints = constraints || [];
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
      new Upgrade('increaseBulletCount', function () {
        this.player.upgrades.push(function () {
          if (this.firing)
            this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x), randomNegation(_.random(10)));
        });
      }),

    reduceCameraShake:
      new Upgrade('reduceCameraShake', function () {
        this.shakeReduction *= 0.85;
      }),

    buildTavern:
      new Upgrade('buildTavern', function () {
        var tavern = new Tavern(300, 300, this.resources);
        this.entities.push(tavern);
        this.friendlies.push(tavern);
      }, [[new UpgradeConstraint('upgradeCountWithinRange'), 'buildTavern', 0, 1]]),

    heroGunner:
      new Upgrade('heroGunner', function () {
        var gunner = new Gunner(300, 300, this.resources);
        this.entities.push(gunner);
        this.friendlies.push(gunner);
      }, [['buildTavern', 1]]),

    gunnerTracking:
      new Upgrade('gunnerTracking', function () {
        var betterFireAt = function (ent) {
          var bulletTravelTime = this.distanceTo(ent) / new Bullet().speed;
          var moveDelta = ent.getMoveDelta(this.game.player.x, this.game.player.y, ent.speed, ent.health / 10);
          this.fire(Math.atan2(this.y - ent.y - bulletTravelTime * moveDelta.y , this.x - ent.x - bulletTravelTime * moveDelta.x));
        };

        this.friendlies.filter(function (ent) { return ent.constructor === Gunner; }).forEach(function (gunner) {
          gunner.fireAt = betterFireAt;
        });

        Gunner.prototype.fireAt = betterFireAt;
      },  [['heroGunner', 1], [new UpgradeConstraint('upgradeCountWithinRange'), 'gunnerTracking', 0, 1]]),

    gunnerBulletCount:
      new Upgrade('gunnerBulletCount', function () {
        this.friendlies.filter(function (ent) { return ent.constructor === Gunner; }).forEach(function (gunner) {
          gunner.fireRate = Math.ceil(gunner.fireRate * 0.75);
        });

        Gunner.fireRate = Math.ceil(Gunner.fireRate * 0.75);
      }, [['heroGunner', 1]]),

    heroSniper:
      new Upgrade('heroSniper', function () {
        var sniper = new Sniper(300, 300, this.resources);
        this.entities.push(sniper);
        this.friendlies.push(sniper);
      }, [['buildTavern', 1]]),
  };
}