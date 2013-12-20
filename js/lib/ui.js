function UI(game) {
  this.game = game;
  this.populateUpgradeButtons(game.upgrades.list);
  // this.setupBindings();
}

UI.prototype = {
  setupBindings: function () {
    // var game = this.game;
  },

  setAvailableUpgrades: function () {
    _.keys(this.game.upgrades.list).forEach(function (upgradeName) {
      var upgrade = this.game.upgrades.list[upgradeName];
      if (upgrade.isConstraintsMet(this.game)) {
        $('[data-upgrade=' + upgrade.name + ']').toggleClass('active-upgrade', true);
      } else {
        $('[data-upgrade=' + upgrade.name + ']').toggleClass('active-upgrade', false);
      }
    }.bind(this));
  },

  scaleCanvas: function () {
    var canvas = $("#canvas")[0];
    canvas.style.height = window.innerHeight + "px";
    canvas.style.width  = canvas.style.height / 9 * 16 + "px";
    console.log(canvas.height);
    this.game.scaleRatio = canvas.height / window.innerHeight;
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
      el.on('click', function (e) {
        that.setAvailableUpgrades();
        that.game.upgrade($(this).attr('data-upgrade'));
      });

      return el;
  }
};