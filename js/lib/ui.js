function UI(game) {
  this.game = game;
  this.setupBindings();
}

UI.prototype = {
  setupBindings: function () {
    var game = this.game;
    $('.upgrade').click(function (e) {
      game.upgrade($(this).attr('data-upgrade'));
    });
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
  }
};