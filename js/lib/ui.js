function UI(game) {
  this.game = game;
  this.mouse = { x: 0, y: 0 };
  this.cssScale = 1;
  this.populateUpgradeButtons(game.upgrades.list);
  this.setupBindings();
  this.updateGold();
  this.updateHealth();
  $(".loading").fadeOut(90);
}

UI.prototype = {
  setupBindings: function() {
    var game = this.game;

    window.onblur = this.pauseGame.bind(this);

    $("#canvas").mousemove(
      function(e) {
        // Factor in CSS scaling of canvas distorting mouse pointer location comparisons
        // as canvas is not aware of external scaling.
        this.mouse.x = this.cssScale * (e.pageX - game.canvas.offsetLeft);
        this.mouse.y = this.cssScale * (e.pageY - game.canvas.offsetTop);
      }.bind(this)
    );

    // Cheats
    if (game.debug) {
      $("#add-gold").click(function() {
        game.addGold(1000);
      });

      $("#add-player-xp").click(function() {
        game.player.xp += 100;
        game.player.checkLevelUp();
        game.player.checkHeroInfo();
      });

      $("#add-player-health").click(
        function() {
          this.game.player.health = Number.MAX_VALUE;
          this.game.ui.updateHealth();
        }.bind(this)
      );

      $("#add-time").click(function() {
        setDayColour(game, Math.round((game.timeOfDay + 600 * 12) / 600)); // eslint-disable-line
      });
    }

    // Keybindings
    keypress.combo("space", this.pauseGameToggle.bind(this));
  },

  gameOver: function() {
    $(".container").addClass("vignette");
    $(".ui").addClass("pause-overlay");
    $(".game-over").show();
    this.game.running = false;

    $(".game-over .restart").click(function() {
      // hack!
      document.location.reload();
    });
  },

  pauseGameToggle: function() {
    if (this.game.gameOver) return;

    if (this.game.running) {
      this.pauseGame();
    } else {
      this.unpauseGame();
    }
  },

  pauseGame: function() {
    if (this.game.gameOver) return;

    this.game.running = false;
    this.game.audio.setMasterVolume(0);
    this.setAvailableUpgrades();
    $(".container").addClass("vignette");
    $(".ui").addClass("pause-overlay");
    $(".paused").css("display", "flex");
  },

  unpauseGame: function() {
    if (!this.game.running) {
      this.game.running = true;
      this.game.draw();
    }
    this.game.audio.setMasterVolume(1);
    $(".container").removeClass("vignette");
    $(".ui").removeClass("pause-overlay");
    $(".paused").hide();
  },

  tick: function() {
    this.setAvailableUpgrades();
  },

  setAvailableUpgrades: function() {
    _.keys(this.game.upgrades.list).forEach(
      function(upgradeName) {
        var upgrade = this.game.upgrades.list[upgradeName];
        var upgradeEl = $("[data-upgrade=" + upgrade.name + "]");

        if (
          typeof upgrade.classNames === "object" &&
          upgrade.classNames.length
        ) {
          upgrade.classNames.forEach(function(className) {
            upgradeEl.toggleClass(className, true);
          });
        }

        if (upgrade.isConstraintsMet(this.game)) {
          upgradeEl
            .toggleClass("active-upgrade", true)
            .toggleClass("button", true)
            .toggleClass("lame-upgrade", !!upgrade.lame)
            .toggleClass("important-upgrade", !!upgrade.important);
        } else {
          upgradeEl
            .toggleClass("active-upgrade", false)
            .toggleClass("button", false);
        }

        if (typeof upgrade.text.name === "function") {
          upgradeEl.find(".upgrade-name").text(upgrade.text.name());
        }

        if (typeof upgrade.text.cost === "function") {
          upgradeEl.find(".upgrade-cost").text(upgrade.text.cost());
        }

        if (typeof upgrade.text.effect === "function") {
          upgradeEl.find(".upgrade-effect").text(upgrade.text.effect());
        }

        if (typeof upgrade.text.highlight === "function") {
          upgradeEl.toggleClass("upgrade-highlight", upgrade.text.highlight());
        } else if (upgrade.text.highlight) {
          upgradeEl.toggleClass("upgrade-highlight", upgrade.text.highlight);
        }
      }.bind(this)
    );
  },

  updateHealth: function() {
    if (this.game.player.health <= 2) {
      $(".ui").addClass("blood-vision");
    } else {
      $(".ui").removeClass("blood-vision");
    }

    $(".health > .health-amount").text(this.game.player.health);
  },

  updateGold: function() {
    $(".gold > .gold-amount").text(this.game.gold);
    $(".hero-list-item").first().find(".hero-gold").text("G " + this.game.gold); // Player gold UI hack
  },

  scaleCanvas: function() {
    var canvas = document.getElementById("canvas");

    var getCanvasCSSHeight = function() {
      return parseInt($(canvas).css("height"), 10);
    };

    var getCanvasCSSWidth = function() {
      return parseInt($(canvas).css("width"), 10);
    };

    if (window.innerWidth / window.innerHeight > 16 / 9) {
      canvas.style.height = window.innerHeight + "px";
      canvas.style.width = getCanvasCSSHeight() / 9 * 16 + "px";
      this.cssScale = canvas.height / window.innerHeight;
    } else {
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = getCanvasCSSWidth() / 16 * 9 + "px";
      this.cssScale = canvas.width / window.innerWidth;
    }

    var persistentCanvas = $("#persistent-canvas")[0];
    var fadeCanvas = $("#fade-canvas")[0];
    this.lightingCanvas = $("#lighting-canvas")[0];

    [persistentCanvas, fadeCanvas, this.lightingCanvas].forEach(function(c) {
      c.style.height = canvas.style.height;
      c.style.width = canvas.style.width;
      c.style.left = canvas.offsetLeft + "px";
      c.style.top = canvas.offsetTop + "px";
    });
  },

  populateUpgradeButtons: function(object) {
    _.keys(object).forEach(
      function(upgradeName) {
        var upgrade = object[upgradeName];
        $(".upgrades").append(
          this.createUpgradeButton(
            "#template-upgrade",
            upgrade.name,
            upgrade.text
          )
        );
      }.bind(this)
    );
  },

  createUpgradeButton: function(template, upgradeId, data) {
    var el = $($(template).html());
    el.attr("data-upgrade", upgradeId);
    el.find(".upgrade-name").text(data.name || "");
    el.find(".upgrade-cost").text(data.cost || "");
    el.find(".upgrade-effect").text(data.effect || "");
    el.find(".upgrade-flavour").text(data.flavour || "");

    var that = this;
    el.mouseenter(function(_e) {
      if ($(this).hasClass("button")) {
        that.game.audio.play("hit_hurt");
      }
    });

    el.mousedown(function(_e) {
      that.game.audio.play("click");
    });

    el.mouseup(function(_e) {
      that.game.upgrade($(this).attr("data-upgrade"));
      that.setAvailableUpgrades();
    });

    return el;
  },

  setLevelInformation: function(text) {
    $(".level-information").text(text);
  },

  addToHeroList: function(hero) {
    var el = this.createHeroListItem("#template-hero-list-item", hero);
    $(".hero-list").append(el);
    return el;
  },

  updateHeroListItem: function(el, hero) {
    if (hero.markedForDeletion) {
      el.remove();
    } else {
      // Optimised out jQuery
      el[0].childNodes[1].children[0].src = hero.getImage().src;
      el[0].childNodes[3].children[0].children[0].innerHTML = hero.name;
      el[0].childNodes[3].children[0].children[1].innerHTML = hero.level;
      el[0].childNodes[3].children[1].children[0].innerHTML = "K " + hero.kills;
      el[0].childNodes[3].children[1].children[1].innerHTML = "XP " + hero.xp;
      el[0].childNodes[3].children[1].children[2].innerHTML =
        "G " + (hero.constructor === Player ? this.game.gold : hero.gold);

      if (hero.weapon && hero.weapon.hasMagazine) {
        el[0].childNodes[3].children[1].children[3].innerHTML =
          "•" + hero.weapon.bullets;
      }
    }
  },

  addGameUpgradeIcon: function(icon, tooltip) {
    $(".game-upgrades").append(this.createUpgradeIcon(icon, tooltip));
  },

  addHeroUpgradeIcon: function(el, icon, tooltip) {
    el.find(".hero-upgrades").append(this.createUpgradeIcon(icon, tooltip));
  },

  createUpgradeIcon: function(icon, tooltip) {
    return $("<img />", {
      src: icon.src,
      class: "hero-upgrade-icon",
      title: tooltip
    });
  },

  createHeroListItem: function(template, hero) {
    var el = $($(template).html());
    this.updateHeroListItem(el, hero);

    el.mouseenter(function(_e) {
      hero.highlighted = true;
    });

    el.mouseout(function(_e) {
      hero.highlighted = false;
    });

    return el;
  },

  createPopup: function(template, left, top, text, duration) {
    template = template || "#template-popup";
    duration = duration || 5000;

    var el = $($(template).html());
    el.find(".text").text(text);
    el.css("left", left / this.cssScale + this.game.canvas.offsetLeft + "px");
    el.css("top", top / this.cssScale + this.game.canvas.offsetTop + "px");

    setTimeout(function() {
      el.fadeOut(1000, function() {
        el.remove();
      });
    }, duration);

    $(".ui").append(el);
  },

  createSpeechBubble: function(template, left, top, text, duration) {
    template = template || "#template-speech-bubble";
    duration = duration || 5000;

    var el = $($(template).html());
    el.find(".text").text(text);
    el.css("left", left / this.cssScale + this.game.canvas.offsetLeft + "px");
    el.css("top", top / this.cssScale + this.game.canvas.offsetTop + "px");

    setTimeout(function() {
      el.fadeOut(1000, function() {
        el.remove();
      });
    }, duration);

    $(".ui").append(el);
  },

  flash: function(elSelector, color) {
    var el = document.querySelector(elSelector);
    if (el) {
      el.classList.add("flash-none");
      var cssClass = "flash-" + color;
      el.classList.add(cssClass);
      setTimeout(function() {
        el.classList.remove(cssClass);
      }, 100);
    } else {
      /* eslint-disable no-console */
      console.log(
        "No element found for selector '" + elSelector + "' to flash"
      );
    }
  }
};
