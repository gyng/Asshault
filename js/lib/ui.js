function UI (game) {
  this.game = game;
  this.mouse = { x: 0, y: 0 };
  this.cssScale = 1;
  this.populateUpgradeButtons(game.upgrades.list);
  this.setupBindings();
  this.updateGold();
  $(".loading").hide();
}

UI.prototype = {
  setupBindings: function () {
    var game = this.game;

    window.onblur = function () {
      game.running = false;
      game.audio.setMasterVolume(0);
      $('.ui').css('background-color', 'rgba(0, 0, 0, 0.7)');
    };

    window.onfocus = function () {
      game.running = true;
      game.draw();
      game.audio.setMasterVolume(1);
      $('.ui').css('background-color', 'transparent');
    };

    $('#canvas').mousemove(function (e) {
      // Factor in CSS scaling of canvas distorting mouse pointer location comparisons
      // as canvas is not aware of external scaling.
      this.mouse.x = this.cssScale * (e.pageX - game.canvas.offsetLeft);
      this.mouse.y = this.cssScale * (e.pageY - game.canvas.offsetTop);
    }.bind(this));

    // Cheats
    if (game.debug) {
      $('#add-gold').click(function () {
        game.addGold(1000);
      });

      $('#add-player-xp').click(function () {
        game.player.xp += 100;
        game.player.checkLevelUp();
        game.player.checkHeroInfo();
      });
    }
  },

  tick: function () {
    this.setAvailableUpgrades();
    // this.scaleCanvas();
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

  updateGold: function () {
    $('.gold-amount').text(this.game.gold);
  },

  scaleCanvas: function () {
    var canvas = document.getElementById('canvas');

    var getCanvasCSSHeight = function () {
      return parseInt($(canvas).css("height"), 10);
    };

    var getCanvasCSSWidth = function () {
      return parseInt($(canvas).css("width"), 10);
    };

    if (window.innerWidth / window.innerHeight > 16 / 9) {
      canvas.style.height = window.innerHeight + "px";
      canvas.style.width  =  getCanvasCSSHeight() / 9 * 16 + "px";
      this.cssScale = canvas.height / window.innerHeight;
    } else {
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height  =  getCanvasCSSWidth() / 16 * 9 + "px";
      this.cssScale = canvas.width / window.innerWidth;
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
      // Optimised out jQuery
      el[0].childNodes[1].children[0].src = hero.getImage().src;
      el[0].childNodes[3].children[0].children[0].innerHTML = hero.name;
      el[0].childNodes[3].children[0].children[1].innerHTML = hero.level;
      el[0].childNodes[3].children[1].children[0].innerHTML = 'K ' + hero.kills;
      el[0].childNodes[3].children[1].children[1].innerHTML = 'XP ' + hero.xp;
    }
  },

  addGameUpgradeIcon: function (icon, tooltip) {
    $('.game-upgrades').append(this.createUpgradeIcon(icon, tooltip));
  },

  addHeroUpgradeIcon: function (el, icon, tooltip) {
    el.find('.hero-upgrades').append(this.createUpgradeIcon(icon, tooltip));
  },

  createUpgradeIcon: function (icon, tooltip) {
    return $('<img />', {
      'src': icon.src,
      'class': 'hero-upgrade-icon',
      'title': tooltip
    });
  },

  createHeroListItem: function (template, hero) {
    var el = $($(template).html());
    this.updateHeroListItem(el, hero);

    el.mouseenter(function (e) {
      hero.highlighted = true;
    });

    el.mouseout(function (e) {
      hero.highlighted = false;
    });

    return el;
  },

  createSpeechBubble: function (template, left, top, text, duration) {
    template = template || '#template-speech-bubble';
    duration = duration || 5000;

    var el = $($(template).html());
    el.find('.text').text(text);
    el.css('left', left / this.cssScale + this.game.canvas.offsetLeft + 'px');
    el.css('top',  top / this.cssScale + this.game.canvas.offsetTop + 'px');

    setTimeout(function () {
      el.fadeOut(1000, function () {
        el.remove();
      });
    }, duration);

    $('.ui').append(el);
  }
};