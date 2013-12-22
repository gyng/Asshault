require.config({
  shim: {
    'lib/game': {
      deps: [
        'lib/renderer',
        'lib/audio',
        'lib/sprites',
        'lib/level',
        'lib/upgrade',

        'lib/entities/gunner',
        'lib/entities/sniper',
        'lib/entities/player',
        'lib/entities/bullet',
        'lib/entities/enemy',
        'lib/entities/cleaner',
        'lib/entities/effects',
        'lib/entities/buildings'
      ]
    },

    'lib/entities/gunner':    { deps: ['lib/entity'] },
    'lib/entities/sniper':    { deps: ['lib/entity'] },
    'lib/entities/player':    { deps: ['lib/entity'] },
    'lib/entities/bullet':    { deps: ['lib/entity'] },
    'lib/entities/enemy':     { deps: ['lib/entity'] },
    'lib/entities/cleaner':   { deps: ['lib/entity'] },
    'lib/entities/effects':   { deps: ['lib/entity'] },
    'lib/entities/buildings': { deps: ['lib/entity'] },
  },
});

require([
  "vendor/jquery-2.0.3.min",
  "vendor/underscore-min",
  "vendor/keypress-1.0.9.min",
  "lib/util"
  ], function () {
    require(["lib/game", "lib/ui"], function () {
      'use strict';
      $(document).ready(function () {
        new Game(true);
      });
    });
  }
);