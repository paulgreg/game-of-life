# Game of life

A game of line in HTML / JS using canvas.

It uses an `OffscreenCanvas` for performances : renderering is done on screen then copied to main canvas.

You can change initial parameter with URLs query parameters : 
- loop : time in ms between 2 loop (by default, it uses `requestAnimationFrame`)
- scale : « zoom » (2 by default)
- birth: value between 0 and 1 populating initial cells (0.9 by default)


Exemple : https://paulgreg.me/game-of-life/?loop=100&birth=0.5&scale=4