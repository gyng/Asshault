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

  checkAvailableUpgrades: function () {
    this.game.upgradeList.forEach(function (upgrade) {

    });
  }
};