require.config({
  shim: {
    'lib/gunner': {
        deps: ['lib/entity', 'lib/player']
    },
    'lib/player': {
        deps: ['lib/entity']
    },
    'lib/bullet': {
        deps: ['lib/entity']
    },
    'lib/enemy': {
        deps: ['lib/entity']
    },
    'lib/effects': {
        deps: ['lib/entity']
    },
    'lib/buildings': {
      deps: ['lib/entity']
    },
    'lib/game': {
        deps: ['lib/gunner', 'lib/player', 'lib/bullet', 'lib/enemy', 'lib/effects', 'lib/buildings', 'lib/upgrade']
    }
  }
});

require(["vendor/jquery-2.0.3.min"], function () {
  require([
    "vendor/keypress-1.0.9.min",
    "lib/game",
    "lib/ui"
    ], function () {
      'use strict';

      $(document).ready(function () {
        new Game();
      });
    }
  );
});