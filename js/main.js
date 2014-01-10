require.config({
  shim: {
    'lib/game': {
      deps: [
        'lib/SpatialHash',
        'lib/renderer',
        'lib/audio',
        'lib/sprites',
        'lib/level',
        'lib/upgrade',
        'lib/weapon',

        'lib/levels/levels',
        'lib/levels/breaklevel',

        'lib/entities/gunner',
        'lib/entities/sniper',
        'lib/entities/player',
        'lib/entities/bullet',
        'lib/entities/enemy',
        'lib/entities/cleaner',
        'lib/entities/tavern',
        'lib/entities/pointdefensedrone',

        'lib/entities/effects/bulletping',
        'lib/entities/effects/explosion',

        'lib/weapons/machinegun',
      ]
    },

    'lib/levels/breaklevel':  { deps: ['lib/level'] },
    'lib/levels/levels':      { deps: [
      'lib/level',
      'lib/levels/breaklevel'
    ]},

    'lib/entities/gunner':               { deps: ['lib/entity'] },
    'lib/entities/sniper':               { deps: ['lib/entity'] },
    'lib/entities/player':               { deps: ['lib/entity'] },
    'lib/entities/bullet':               { deps: ['lib/entity'] },
    'lib/entities/enemy':                { deps: ['lib/entity'] },
    'lib/entities/cleaner':              { deps: ['lib/entity'] },
    'lib/entities/tavern':               { deps: ['lib/entity'] },
    'lib/entities/pointdefensedrone':    { deps: ['lib/entity'] },

    'lib/entities/effects/bulletping':   { deps: ['lib/entity'] },
    'lib/entities/effects/explosion':    { deps: ['lib/entity'] },

    'lib/weapons/machinegun':            { deps: ['lib/weapon'] },
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
