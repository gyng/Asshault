function Upgrade (data) {
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
  this.game = game;
  this.list = {
    increaseBulletCount:
      new Upgrade({
        name:  'increaseBulletCount',
        effect: function () {
          this.subtractGold(15);
          this.player.weapon.streams.push({ offset: _.random(8), spread: 7 });
          this.player.addUpgrade({ icon: this.sprites.debug, tooltip: 'Increased bullet count.' });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 15],
        ],
        text: {
          name: 'Jury Rig Ammo Feed',
          cost: '15G',
          effect: 'More bullets! Un·bullet·able!'
        }
      }),

    playerPiercingBullets:
      new Upgrade({
        name: 'playerPiercingBullets',
        effect: function () {
          this.player.additionalWeaponPierce += 0.7;
          this.player.addUpgrade({ icon: this.sprites.flash2, tooltip: 'Piercing bullets.' });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 25],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerPiercingBullets', 0, 1]
        ],
        text: {
          name: 'Piercing bullets',
          cost: '25G',
          effect: 'Cut through butter like butter.'
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
          name:   'Reinforce Camera Tripod',
          cost:   '15G',
          effect: 'Reduces camera shake.'
        },
        gameUpgradeIcon: {
          icon:    game.sprites.flash1,
          tooltip: 'Reduced camera shake.'
        }
      }),

    playerMovement:
      new Upgrade({
        name:  'playerMovement',
        effect: function () {
          this.subtractGold(80);

          var position = this.player.components.position;
          var movement = new HelicopterMovementComponent(this.audio);
          var input = new HelicopterInputComponent(position, movement);
          this.player.addComponent(movement);
          this.player.addComponent(input);

          this.player.components.renderShadow.offsetY += 75;
          this.player.components.renderShadow.width *= 1.5;
          this.player.components.renderShadow.height *= 1.5;
          this.player.components.renderShadow.color = "rgba(0, 0, 0, 0.15)";

          this.player.game.audio.loop('helicopter2', 0.3, 0.24, 0.83);

          this.player.addUpgrade({
            effect:  function () {
              // TODO: move into effect component
              this.components.renderSprite.offsetX += Util.randomError(1);
              this.components.renderSprite.offsetY += Util.randomError(1);
            },
            icon:    this.sprites.debug2,
            tooltip: 'Ride of the Valkyries.'
          });
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerMovement', 0, 1],
          [new UpgradeConstraint('propertyWithinRange'), this.game.player, 'level', 1],
          [new UpgradeConstraint('haveGold'), 80]
        ],
        text: {
          name:    'The Flying Machine',
          cost:    '80G, Player Level 1',
          effect:  'Move with the WASD keys. Too hard to control? Just use W (and only W) like the scrub you are.',
          flavour: 'Avoid sun.'
        }
      }),

    buildTavern:
      new Upgrade({
        name:  'buildTavern',
        effect: function () {
          this.subtractGold(25);
          var spawnX = this.player.x + Util.randomNegation(_.random(100, 300));
          var spawnY = this.player.y + Util.randomNegation(_.random(100, 300));
          var tavern = new Tavern(this.resources, { x: spawnX, y: spawnY });
          this.entities.push(tavern);
          this.friendlies.push(tavern);
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'buildTavern', 0, 1],
          [new UpgradeConstraint('haveGold'), 25]
        ],
        text: {
          name:    'A House of Heroes',
          cost:    '25G, No Tavern built',
          effect:  'A tavern is constructed in the village. Taverns are known for attracting heroes of all kinds.',
          flavour: 'Beer, ale and whiskey.'
        },
        gameUpgradeIcon: {
          icon:    game.sprites.tavern,
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
          name:    'A Ram Boar Arrives',
          cost:    'Tavern, 25G',
          effect:  'A Ram Boar is a half-gun, half-man, half-ram and half-boar creature.',
          flavour: 'Ram Boars are known to be broke all the time.'
        }
      }),

    gunnerTracking:
      new Upgrade({
        name:  'gunnerTracking',
        effect: function () {
          this.subtractGold(50);
          var betterFireAt = function (ent) {
            var bulletTravelTime = this.distanceTo(ent) / this.weapon.bulletSpeed;
            var moveDelta = ent.getMoveDelta(this.game.player.x, this.game.player.y, ent.speed, ent.health / 10);
            this.weapon.fire(Math.atan2(this.y - ent.y - bulletTravelTime * moveDelta.y , this.x - ent.x - bulletTravelTime * moveDelta.x));
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
          name:    'Ram Boar Weapons Training',
          cost:    '50G, Ram Boar',
          effect:  'Ram Boars learn to fire ahead of their targets.',
          flavour: 'Who knew Ram Boars didn’t know how to shoot?'
        },
        gameUpgradeIcon: {
          icon:    game.sprites.herogunner,
          tooltip: 'Ram Boar weapons training. Ram Boars lead targets when firing.'
        }
      }),

    gunnerBulletCount:
      new Upgrade({
        name:  'gunnerBulletCount',
        effect: function () {
          this.subtractGold(15);
          _.where(this.friendlies, { constructor: Gunner }).forEach(function (gunner) {
            gunner.weapon.fireRate = Math.ceil(gunner.weapon.fireRate * 0.75);
            gunner.addUpgrade({ icon: game.sprites.debug, tooltip: 'Going fuller auto.' });
          });
        },
        constraints: [
          ['heroGunner', 1],
          [new UpgradeConstraint('haveGold'), 15]
        ],
        text: {
          name:    'Ram Boar Goes Full Auto',
          cost:    '15G, Ram Boar',
          effect:  '25% faster firing for *existing* Ram Boars, up to a limit.',
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
          name:    'A Shartshooper Appears',
          cost:    '50G, Tavern',
          effect:  'Shartshoopers are skilled at ranged combat.',
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
          name:    'Tavern Clean Up Crew Member',
          cost:    '10G, Tavern',
          effect:  'No mess too big.',
          flavour: 'Overtime, again?'
        }
      }),

    playerPointDefenseDrone:
      new Upgrade({
        name: 'playerPointDefenseDrone',
        effect: function () {
          this.subtractGold(15);
          var pdd = new PointDefenseDrone(this.resources, {x : this.player.x, y: this.player.y });
          this.entities.push(pdd);
          this.friendlies.push(pdd);
          this.player.addUpgrade({ icon: this.sprites.flash1, tooltip: 'Point defense drone.' });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 15]
        ],
        text: {
          name:   'Point Defense Drone',
          cost:   '15G',
          effect: 'Zaps nearby foes (bullet upgrade soon!)'
        }
      }),

    pointDefenseDroneBulletHell:
      new Upgrade({
        name: 'pointDefenseDroneBulletHell',
        effect: function () {
          this.subtractGold(35);

          var bulletHellTick = function () {
            var rad = Util.deg2rad(this.age % 360) * this.angularVelocity;
            this.x = this.game.player.x - Math.cos(rad) * this.orbitRadius;
            this.y = this.game.player.y + Math.sin(rad) * this.orbitRadius;
            this.rotation = rad;
            this.weapon.bulletLifespan = 360;
            this.weapon.bulletSpeed = 10;
            this.weapon.damage = 3;
            this.weapon.spread = Util.deg2rad(15);

            if (this.age % 10 === 0) {
              this.weapon.fire(Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x));
            }
          };

          this.friendlies.filter(function (ent) {
            return ent.constructor === PointDefenseDrone;
          }).forEach(function (pdd) {
            pdd.tick = bulletHellTick;
          });

          PointDefenseDrone.prototype.tick = bulletHellTick;
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 35],
          ['playerPointDefenseDrone', 1],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'pointDefenseDroneBulletHell', 0, 1]
        ],
        text: {
          name:    'Point Defence Drone Bullet Hell',
          cost:    '35G',
          effect:  'Bullet hell.',
          flavour: 'wich pdd wud u get hit by'
        },
        gameUpgradeIcon: {
          icon: game.sprites.debug2,
          tooltip: 'Point defense drone bullet hell.'
        }
      }),

    playerBeamWeapon:
      new Upgrade({
        name: 'playerBeamWeapon',
        effect: function () {
          this.subtractGold(50);

          this.player.weapon.applyOverrides({
            spreadMultiplier: 0.5,
            bulletDamage: 0.1,
            fireRate: 0,
            recoilOffset: 0.3,
            recoilCameraShake: 0.5
          });

          this.player.weapon.sounds.beam = 'zap';
          this.player.additionalWeaponPierce = 0.4;

          this.player.weapon.fireSound = function () {
            if (Math.random() > 0.025) {
              this.game.audio.play(this.sounds.beam, Util.clamp(0.15 * this.streams.length, 0.15, 1));
            }
          };

          this.player.addUpgrade({ icon: this.sprites.flash2, tooltip: 'Nearly as good as SLB.' });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 50],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerBeamWeapon', 0, 1],
        ],
        text: {
          name:    'Moonlight Breaker',
          cost:    '15G',
          effect:  'Beam weapon.',
          flavour: 'Second degree sunlight.'
        }
      }),
  };
}