# Asshault

![Screenshot](http://i.imgur.com/lzGBXrD.png)

Asshault is an in-browser action game created to play around with [game feel](https://www.youtube.com/watch?v=AJdEqssNZ-U), or [juice](https://www.youtube.com/watch?v=Fy0aCDmgnxg). Juice, among other things, comprises effects such as camera shake, particles, and sounds.

As such, the code is hacked together, and should really be refactored from the current prototypal inheritance into an entity-component system.

Some of the more interesting features and optimisation techniques I've used/experimented with here include:

* Flexible upgrade system with constraints, along with a flexbox UI for available upgrades
* 3D camera shake; affects UI (CSS)
* Double canvases, one for decals and one for drawing
* Proper HTML canvas resizing based off window size
* Simple spatial hash for faster collision detection
* Simple sound system for playing sounds, with an audio compressor attached
* Dirty detection of text for rendering on canvases (big perf hit)
* Waves/levels
* Simple sprite management and rendering system
* Sprite-based effects
* Highlighting in-canvas objects on hover of HTML elements

## Running locally
1. Clone
2. Open `index.html` in a browser