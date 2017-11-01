# Asshault

![Screenshot](http://i.imgur.com/lzGBXrD.png)

Asshault is an in-browser action game started in 2013 to play around with [game feel](https://www.youtube.com/watch?v=AJdEqssNZ-U), or [juice](https://www.youtube.com/watch?v=Fy0aCDmgnxg). Juice, among other things, comprises effects such as camera shake, particles, and sounds.

This is a for-fun project! I get to do things I don't usually get to do: animations, sprites, sounds, game ideas and the like. As such, the code is *hacked together*, and should really be refactored from the current prototypal inheritance into an entity-component system.

Some of the more interesting features and optimisation techniques I've used/experimented with here include:

* Flexible upgrade system with constraints, along with a flexbox UI for available upgrades
* 3D camera shake; affects UI (CSS)
* Triple canvases, one for decals, one for drawing, and one for fading effects trails
* Proper HTML canvas resizing based off window size
* Simple spatial hash for faster collision detection
* JSON-based asset loading
* Simple sound system for playing sounds, with an audio compressor attached
* Simple sprite management and rendering system
* Dirty detection of text for rendering on canvases (big perf hit)
* Waves/levels
* Sprite-based effects
* Animated sprites
* Highlighting in-canvas objects on hover of HTML elements

## Running locally
1. Clone
2. Open `index.html` in a browser
