### NOTICE REGARDING ENMASSE ENTERTAINMENT (NA) TERA
This software in this repository does not work in combination with the NA version of TERA hosted by EME (neither PC, nor PS4/XB1 servers). It contains no intellectual property belonging to them.

# tera-game-state
Game state tracking library for tera-proxy

# Documentation
- Submodule `me`: [here](doc/me.md)
- Submodule `contract`: [here](doc/contract.md)

# Requesting submodules
To reduce overhead, most submodules need to be explicitly requested by a module using them (during initialization, recommended in the module's constructor):
```js
module.exports = function GameStateExample(mod) {
    mod.game.initialize(["me", "contract"]);
    
    // Submodules "me" and "contract" can now be used.
    // Note that "me" does not need to be explicitly requested; it is always loaded by default!
    mod.game.contract.on("begin", (type, id) => {
        // Do stuff!
    });
}
```

# Usage example
```js
module.exports = function GameStateExample(mod) {
    // An instance of tera-game-state (as well as command) is readily available through mod.game!
    
    // You can register event handlers (higher-level abstraction than just listening to packets)
    mod.game.on('enter_game', () => {
        console.log(`You are now ingame on a ${mod.game.me.race} ${mod.game.me.gender} ${mod.game.me.class}!`);
        
        // Special action required for human male brawler (names are taken directly from DC to avoid confusion)
        if(mod.game.me.race === 'human' && mod.game.me.gender === 'male' && mod.game.me.class === 'fighter')
        {
            // Do stuff!
        }
    });
    
    mod.game.on('leave_game', () => {
        // Clean up!
    });
    
    mod.game.on('enter_loading_screen', () => {
        // ...
    });
    
    // Or you can just access its data at any time:
    mod.hook('S_ABNORMALITY_BEGIN', 2, (event) => {        
        if(mod.game.me.is(event.target))
        {
            console.log('An abnormality was applied to the player!');
        }
    });
}
```
