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
          this.subtractGold(250);
          this.player.additionalWeaponPierce += 0.7;
          this.player.addUpgrade({ icon: this.sprites.flash2, tooltip: 'Piercing bullets.' });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 250],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerPiercingBullets', 0, 1]
        ],
        text: {
          name: 'Piercing bullets',
          cost: '250G',
          effect: 'No better way to cut through butter.'
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

    playerFlyingMovement:
      new Upgrade({
        name:  'playerFlyingMovement',
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

            var deg = Util.rad2deg(this.rotation);

            if (axis === 'x') {
              deg = deg - 90;
            }

            if (deg < -180) {
              deg = deg + 360;
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

            this.heloXAcceleration += this.accelerationRate * scaling * closeToEW * xFlip;
            this.heloYAcceleration += this.accelerationRate * scaling * closeToNS * yFlip;

            this.heloXAcceleration = Util.clamp(this.heloXAcceleration, this.minAcceleration, this.maxAcceleration);
            this.heloYAcceleration = Util.clamp(this.heloYAcceleration, this.minAcceleration, this.maxAcceleration);

            this.heloXSpeed = Util.clamp(this.heloXSpeed + this.heloXAcceleration, -this.maxSpeed, this.maxSpeed);
            this.heloYSpeed = Util.clamp(this.heloYSpeed + this.heloYAcceleration, -this.maxSpeed, this.maxSpeed);
          };

          this.player.heloMove = function () {
            this.x += this.heloXSpeed;
            this.y += this.heloYSpeed;

            this.heloXSpeed *= this.friction;
            this.heloYSpeed *= this.friction;
            this.heloXAcceleration *= this.friction - 0.025;
            this.heloYAcceleration *= this.friction - 0.025;

            this.drawOffset.x += Util.randomError(1);
            this.drawOffset.y += Util.randomError(1);

            if (Util.hypotenuse(this.heloXSpeed, this.heloYSpeed) > 1 &&
              this.age % 60 === 0) {
              this.game.audio.play('helicopter1', 0.2);
            }
          };

          this.player.game.audio.loop('helicopter2', 0.3, 0.24, 0.83);

          this.player.addUpgrade({
            effect:  function () { this.heloMove(); },
            icon:    this.sprites.debug2,
            tooltip: 'Ride of the Valkyries.'
          });
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerFlyingMovement', 0, 1],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerWalkingMovement', 0, 1],
          [new UpgradeConstraint('propertyWithinRange'), this.game.player, 'level', 1],
          [new UpgradeConstraint('haveGold'), 80]
        ],
        text: {
          name:    'The Flying Machine',
          cost:    '80G, Player Level 1',
          effect:  'Are you a legit flyboy? Move with the WASD keys. (Harder to control, but faster than walking)',
          flavour: 'Avoid sun.'
        }
      }),

    playerWalkingMovement:
      new Upgrade({
        name:  'playerWalkingMovement',
        effect: function () {
          this.subtractGold(50);

          this.player.keyW = false;
          this.player.keyA = false;
          this.player.keyS = false;
          this.player.keyD = false;
          this.player.moveDeltaX = 0;
          this.player.moveDeltaY = 0;
          var moveSpeed = 3;

          window.addEventListener("keydown", function (event) {
            switch (event.keyCode) {
              case 68: this.keyD = true; break;
              case 83: this.keyS = true; break;
              case 65: this.keyA = true; break;
              case 87: this.keyW = true; break;
            }
          }.bind(this.player), false);

          window.addEventListener("keyup", function (event) {
            switch (event.keyCode) {
              case 68: this.keyD = false; break;
              case 83: this.keyS = false; break;
              case 65: this.keyA = false; break;
              case 87: this.keyW = false; break;
            }
          }.bind(this.player), false);

          this.player.walk = function () {
            var actualMoveSpeed = moveSpeed;
            if ((this.keyW && this.keyA) ||
                (this.keyW && this.keyD) ||
                (this.keyA && this.keyS) ||
                (this.keyS && this.keyD)) {
              actualMoveSpeed = Math.sqrt(moveSpeed * moveSpeed / 2);
            }

            if (this.keyW) { this.moveDeltaY = -actualMoveSpeed; }
            if (this.keyS) { this.moveDeltaY = actualMoveSpeed; }
            if (this.keyA) { this.moveDeltaX = -actualMoveSpeed; }
            if (this.keyD) { this.moveDeltaX = actualMoveSpeed; }

            this.x += this.moveDeltaX;
            this.y += this.moveDeltaY;

            this.moveDeltaX *= 0.9;
            this.moveDeltaY *= 0.9;
            this.drawOffset.y *= 0.9;
            this.drawOffset.scaleX += (1 - this.drawOffset.scaleX) * 0.1;
            this.drawOffset.scaleY += (1 - this.drawOffset.scaleY) * 0.1;

            var moveIntensity = Math.sqrt(this.moveDeltaX * this.moveDeltaX + this.moveDeltaY * this.moveDeltaY);
            if (this.age % 15 === 0 && moveIntensity > 0.5) {
              this.drawOffset.y += 7 + _.random(3);
              this.drawOffset.scaleX = 1.05;
              this.drawOffset.scaleY = 0.9;
              this.game.audio.play('walk' + (_.random(2) + 1), 0.2 * moveIntensity);

              this.game.renderer.drawDecal(
                this.sprites.explosion1,
                this.x + this.width / 2,
                this.y + this.height / 2,
                Util.randomRad(),
                10,
                10);
            }
          };

          this.player.addUpgrade({
            effect:  function () { this.walk(); },
            icon:    this.sprites.debug2,
            tooltip: 'Perambulator ambulator.'
          });
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerWalkingMovement', 0, 1],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerFlyingMovement', 0, 1],
          [new UpgradeConstraint('haveGold'), 50]
        ],
        text: {
          name:    'The Walking Machine',
          cost:    '50G, Player Level 1',
          effect:  'Fear flying? Walk! Slowly. Move with the WASD keys.',
          flavour: 'Ambulate in your new perambulator.'
        }
      }),

    buildTavern:
      new Upgrade({
        name:  'buildTavern',
        effect: function () {
          this.subtractGold(35);
          var spawnX = this.player.x + Util.randomNegation(_.random(100, 300));
          var spawnY = this.player.y + Util.randomNegation(_.random(100, 300));
          var tavern = new Tavern(this.resources, { x: spawnX, y: spawnY });
          this.entities.push(tavern);
          this.friendlies.push(tavern);
        },
        constraints: [
          [new UpgradeConstraint('upgradeCountWithinRange'), 'buildTavern', 0, 1],
          [new UpgradeConstraint('haveGold'), 35]
        ],
        text: {
          name:    'A House of Heroes',
          cost:    '35G, No Tavern built',
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
          this.subtractGold(50);
          var tavern = _.findWhere(this.entities, { constructor: Tavern });
          var gunner = new Gunner(this.resources, { x: tavern.x, y: tavern.y });
          this.entities.push(gunner);
          this.friendlies.push(gunner);
        },
        constraints: [
          ['buildTavern', 1],
          [new UpgradeConstraint('haveGold'), 50]
        ],
        text: {
          name:    'A Ram Boar Arrives',
          cost:    'Tavern, 50G',
          effect:  'A Ram Boar is a half-gun, half-man, half-ram and half-boar creature.',
          flavour: 'Ram Boars are known to be broke all the time.'
        }
      }),

    gunnerTracking:
      new Upgrade({
        name:  'gunnerTracking',
        effect: function () {
          this.subtractGold(200);
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
          [new UpgradeConstraint('haveGold'), 200]
        ],
        text: {
          name:    'Ram Boar Weapons Training',
          cost:    '200G, Ram Boar',
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
          this.subtractGold(100);
          _.where(this.friendlies, { constructor: Gunner }).forEach(function (gunner) {
            gunner.weapon.fireRate = Math.ceil(gunner.weapon.fireRate * 0.75);
            gunner.addUpgrade({ icon: game.sprites.debug, tooltip: 'Going fuller auto.' });
          });
        },
        constraints: [
          ['heroGunner', 1],
          [new UpgradeConstraint('haveGold'), 100]
        ],
        text: {
          name:    'Ram Boar Goes Full Auto',
          cost:    '100G, Ram Boar',
          effect:  '25% faster firing for *existing* Ram Boars, up to a limit.',
          flavour: 'Always go full auto.'
        }
      }),

    heroSniper:
      new Upgrade({
        name:  'heroSniper',
        effect: function () {
          this.subtractGold(100);
          var tavern = _.findWhere(this.entities, { constructor: Tavern });
          var sniper = new Sniper(this.resources, { x: tavern.x, y: tavern.y });
          this.entities.push(sniper);
          this.friendlies.push(sniper);
        },
        constraints: [
          ['buildTavern', 1],
          [new UpgradeConstraint('haveGold'), 100]
        ],
        text: {
          name:    'A Shartshooper Appears',
          cost:    '100G, Tavern',
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
          flavour: 'No salary too small.'
        }
      }),

    playerPointDefenseDrone:
      new Upgrade({
        name: 'playerPointDefenseDrone',
        effect: function () {
          this.subtractGold(75);
          var pdd = new PointDefenseDrone(this.resources, {x : this.player.x, y: this.player.y });
          this.entities.push(pdd);
          this.friendlies.push(pdd);
          this.player.addUpgrade({ icon: this.sprites.flash1, tooltip: 'Point defense drone.' });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 75]
        ],
        text: {
          name:    'Point Defense Drone',
          cost:    '75G',
          effect:  'Zaps nearby foes.',
          flavour: 'A field of absolute terror. For when your friends intrude on your absolute territory.'
        }
      }),

    pointDefenseDroneBulletHell:
      new Upgrade({
        name: 'pointDefenseDroneBulletHell',
        effect: function () {
          this.subtractGold(100);

          var bulletHellTick = function () {
            var rad = Util.deg2rad(this.age % 360) * this.angularVelocity;
            this.x = this.game.player.x - Math.cos(rad) * this.orbitRadius;
            this.y = this.game.player.y + Math.sin(rad) * this.orbitRadius;
            this.rotation = rad;
            this.weapon.bulletLifespan = 360;
            this.weapon.bulletSpeed = 10;
            this.weapon.bulletSpeedVariance = 10;
            this.weapon.damage = 3;
            this.weapon.spread = Util.deg2rad(15);

            if (this.age % (10 + _.random(3)) === 0) {
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
          [new UpgradeConstraint('haveGold'), 100],
          ['playerPointDefenseDrone', 1],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'pointDefenseDroneBulletHell', 0, 1]
        ],
        text: {
          name:    'Point Defence Drone Bullet Hell',
          cost:    '100G',
          effect:  'Bullet hell.',
          flavour: 'wich pdd wud u get hit by'
        },
        gameUpgradeIcon: {
          icon: game.sprites.debug2,
          tooltip: 'Point defense drone bullet hell.'
        }
      }),

    playerShotgunWeapon:
      new Upgrade({
        name: 'playerShotgunWeapon',
        effect: function () {
          this.subtractGold(100);

          this.player.weapon.applyOverrides({
            spreadMultiplier: 0.5,
            bulletDamage: 0.1,
            fireRate: 40,
            recoilOffset: 3,
            recoilCameraShake: 3,
            bulletSpeed: 30,
            bulletSpeedVariance: 20
          });

          for (var i = 0; i < 20; i++) {
            this.player.weapon.streams.push({ offset: _.random(20), spread: 20 });
          }

          this.player.addUpgrade({ icon: this.sprites.flash2, tooltip: 'An expert at riding shotgun, and firing one, too.' });
        },
        constraints: [
          [new UpgradeConstraint('haveGold'), 100],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerShotgunWeapon', 0, 1],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerBeamWeapon', 0, 1],
        ],
        text: {
          name:    'Shotgun',
          cost:    '100G',
          effect:  'Become a disciple of the shotgun. Disables other weapon paths.',
          flavour: 'Certified lethal.'
        }
      }),

    playerBeamWeapon:
      new Upgrade({
        name: 'playerBeamWeapon',
        effect: function () {
          this.subtractGold(100);

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
          [new UpgradeConstraint('haveGold'), 100],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerBeamWeapon', 0, 1],
          [new UpgradeConstraint('upgradeCountWithinRange'), 'playerShotgunWeapon', 0, 1],
        ],
        text: {
          name:    'Moonlight Breaker',
          cost:    '100G',
          effect:  'Develop a loving for radiation. Beam weapon. Disables other weapon paths.',
          flavour: 'Second degree sunlight.'
        }
      }),
  };
}
