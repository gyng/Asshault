function UI(game) {
  this.game = game;
  this.populateUpgradeButtons(game.upgrades.list);
  this.setupBindings();
}

UI.prototype = {
  setupBindings: function () {
    var game = this.game;

    window.onblur = function () {
      game.running = false;
      game.audio.setMasterVolume(0);
    };

    window.onfocus = function () {
      game.running = true;
      game.draw();
      game.audio.setMasterVolume(1);
    };
  },

  setAvailableUpgrades: function () {
    _.keys(this.game.upgrades.list).forEach(function (upgradeName) {
      var upgrade = this.game.upgrades.list[upgradeName];
      if (upgrade.isConstraintsMet(this.game)) {
        $('[data-upgrade=' + upgrade.name + ']')
          .toggleClass('active-upgrade', true)
          .toggleClass('button', true);
      } else {
        $('[data-upgrade=' + upgrade.name + ']')
          .toggleClass('active-upgrade', false)
          .toggleClass('button', false);
      }
    }.bind(this));
  },

  scaleCanvas: function () {
    var canvas = $("#canvas")[0];

    var getCanvasCSSHeight = function () {
      return parseInt($(canvas).css("height"), 10);
    };

    var getCanvasCSSWidth = function () {
      return parseInt($(canvas).css("width"), 10);
    };

    if (window.innerWidth / window.innerHeight > 16 / 9) {
      canvas.style.height = window.innerHeight + "px";
      canvas.style.width  =  getCanvasCSSHeight() / 9 * 16 + "px";
      this.game.cssScale = canvas.height / window.innerHeight;
    } else {
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height  =  getCanvasCSSWidth() / 16 * 9 + "px";
      this.game.cssScale = canvas.width / window.innerWidth;
    }

    var persistentCanvas = $("#persistent-canvas")[0];
    persistentCanvas.style.height = canvas.style.height;
    persistentCanvas.style.width  = canvas.style.width;
    persistentCanvas.style.left   = canvas.offsetLeft + "px";
    persistentCanvas.style.top    = canvas.offsetTop + "px";
  },

  populateUpgradeButtons: function (object) {
    _.keys(object).forEach(function (upgradeName) {
      var upgrade = object[upgradeName];
      $('.upgrades').append(
        this.createUpgradeButton("#template-upgrade", upgrade.name, upgrade.text)
      );
    }.bind(this));
  },

  createUpgradeButton: function (template, upgradeId, data) {
      var el = $($(template).html());
      el.attr('data-upgrade', upgradeId);
      el.find('.upgrade-name').text(data.name || '');
      el.find('.upgrade-cost').text(data.cost || '');
      el.find('.upgrade-effect').text(data.effect || '');
      el.find('.upgrade-flavour').text(data.flavour || '');

      var that = this;
      el.mouseenter(function (e) {
        if ($(this).hasClass("button")) {
          that.game.audio.play('hit_hurt');
        }
      });

      el.mousedown(function (e) {
        that.game.audio.play('click');
      });

      el.mouseup(function (e) {
        that.setAvailableUpgrades();
        that.game.upgrade($(this).attr('data-upgrade'));
      });

      return el;
  },

  addToHeroList: function (hero) {
    var el = this.createHeroListItem("#template-hero-list-item", hero);
    $('.hero-list').append(el);
    return el;
  },

  updateHeroListItem: function (el, hero) {
    if (hero.markedForDeletion) {
      el.remove();
    } else {
      el.find('.hero-image').attr('src', hero.getImage().src);
      el.find('.hero-name').text(hero.name);
      el.find('.hero-kills').text('Kills ' + hero.kills);
      el.find('.hero-level').text('Level ' + hero.level);
      el.find('.hero-xp').text('XP ' + hero.xp);

      // var transformation = 'rotate(' + rad2deg(hero.rotation) + 'deg) ';
      // var transformOrigin = hero.width / 2 + 'px ' + hero.height / 2 + 'px';
      // var image = el.find('.hero-image');
      // image.css("transform-origin", transformOrigin);
      // image.css("-webkit-transform-origin", transformOrigin);
      // image.css("transform", transformation);
      // image.css("-webkit-transform", transformation);

      el.mouseenter(function (e) {
        hero.highlighted = true;
      });

      el.mouseout(function (e) {
        hero.highlighted = false;
      });
    }
  },

  createHeroListItem: function (template, hero) {
    var el = $($(template).html());
    this.updateHeroListItem(el, hero);
    // el.find('.hero-upgrades').text(data.flavour || '');

    // var that = this;
    // el.mouseenter(function (e) {
    //   if ($(this).hasClass("button")) {
    //     that.game.audio.play('hit_hurt');
    //   }
    // });

    // el.mousedown(function (e) {
    //   that.game.audio.play('click');
    // });

    // el.mouseup(function (e) {
    //   that.setAvailableHeros();
    //   that.game.upgrade($(this).attr('data-upgrade'));
    // });

    return el;
  },

  createSpeechBubble: function (template, left, top, text, duration) {
    if (!isDefined(template)) template = '#template-speech-bubble';
    duration = duration || 7000;

    var el = $($(template).html());
    el.find('.text').text(text);
    el.css('left', left / this.game.cssScale + this.game.canvas.offsetLeft + 'px');
    el.css('top', top / this.game.cssScale - this.game.canvas.offsetTop + 'px');

    setTimeout(function () {
      el.fadeOut(1000, function () {
        el.remove();
      });
    }, duration);

    $('.ui').append(el);
  }
};