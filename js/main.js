require.config({
  shim: {
    'lib/gunner': {
        deps: ['lib/entity']
    },
    'lib/sniper': {
        deps: ['lib/entity']
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
      deps: ['lib/level', 'lib/gunner', 'lib/sniper', 'lib/player', 'lib/bullet', 'lib/enemy', 'lib/effects', 'lib/buildings', 'lib/upgrade']
    }
  }
});

require(["vendor/jquery-2.0.3.min", "vendor/underscore-min", "lib/util"], function () {
  require([
    "vendor/keypress-1.0.9.min",
    "lib/game",
    "lib/ui"
    ], function () {
      'use strict';

      $(document).ready(function () {
        window.g = new Game();
      });
    }
  );
});