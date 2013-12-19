function Upgrade(name, effect, prereqs) {
  this.name = name;
  this.effect = effect;
  this.prereqs = prereqs || [];
}

Upgrade.prototype = {
  // Prereqs are an array of ['upgradeName', level] or function (game) { return true/false }
  meetPrereqs: function (game) {
    var upgradeCount = game.upgradeCount;
    var met = 0;

    this.prereqs.forEach(function (prereq) {
      if (prereq.length && (upgradeCount[prereq[0]] || 0) >= prereq[1]) {
        met++;
      } else if (typeof prereq === 'function') {
        if (prereq.call(this, game)) met++;
      }
    }.bind(this));

    return met === this.prereqs.length;
  }
};

function UpgradeList (game) {
  this.game = game;
}
UpgradeList.prototype = {
  increaseBulletCount:
    new Upgrade('increaseBulletCount', function () {
      this.player.upgrades.push(function () {
        if (this.firing)
          this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x), Math.random() * 5 * Math.random() > 0.5 ? -1 : 1);
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
    }, [function (game) { return typeof game.upgradeCount.buildTavern === 'undefined' || game.upgradeCount.buildTavern < 1; }]),

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
    }),

  gunnerBulletCount:
    new Upgrade('gunnerBulletCount', function () {
      this.friendlies.filter(function (ent) { return ent.constructor === Gunner; }).forEach(function (gunner) {
        gunner.fireRate = Math.ceil(gunner.fireRate * 0.75);
      });

      Gunner.fireRate = Math.ceil(Gunner.fireRate * 0.75);
    }),

  heroSniper:
    new Upgrade('heroSniper', function () {
      var sniper = new Sniper(300, 300, this.resources);
      this.entities.push(sniper);
      this.friendlies.push(sniper);
    }),
};