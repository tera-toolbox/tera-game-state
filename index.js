const EventEmitter = require('events');

const GameStates = {
    INVALID: 0,
    CHARACTER_LOBBY: 1,
    INGAME: 2,
}

class TeraGameState extends EventEmitter
{
    constructor(mod)
    {
        super();
        this.setMaxListeners(0);

        this.mod = mod;
        this.state = GameStates.INVALID;
        this.isInLoadingScreen = false;
        this.loadedSubmodules = {};

        // Make sure to load game data first
        this.initialize("data");

        // Now initialize default submodules
        this.installHooks();
        this.initialize("me");
    }

    destructor()
    {
        this.setState(GameStates.INVALID);

        for(let submodule in this.loadedSubmodules) {
            this.loadedSubmodules[submodule].destructor();
            delete this[submodule];
        }

        this.loadedSubmodules = undefined;
        this.mod = undefined;
    }

    initialize(submodules)
    {
        if(typeof submodules === 'string')
            submodules = [submodules];

        for(let submodule of submodules)
        {
            if(!this.loadedSubmodules[submodule])
            {
                try
                {
                    let req = require(`./lib/${submodule}`);
                    this.loadedSubmodules[submodule] = new req(this);
                    this[submodule] = this.loadedSubmodules[submodule];
                }
                catch(e)
                {
                    console.log(`[TeraGameState] Unable to load submodule ${submodule}: ${e}`);
                }
            }
        }
    }

    installHook(name, version, cb)
    {
        this.mod.hook(name, version, {order: -9999, filter: {fake: null, modified: null, silenced: null}}, cb);
    }

    installHooks()
    {
        this.installHook('S_GET_USER_LIST', 'raw', (event) => { this.setState(GameStates.CHARACTER_LOBBY); });
        this.installHook('S_RETURN_TO_LOBBY', 'raw', (event) => { this.setState(GameStates.CHARACTER_LOBBY); });
        this.installHook('S_LOGIN', 'raw', (event) => { this.setLoadingScreen(true); this.setState(GameStates.INGAME); });
        this.installHook('S_LOAD_TOPO', 'raw', (event) => { this.setLoadingScreen(true); });
        this.installHook('S_SPAWN_ME', 'raw', (event) => { this.setLoadingScreen(false); });
        this.installHook('S_EXIT', 'raw', (event) => { this.setState(GameStates.INVALID); });
    }

    setState(state)
    {
        if(this.state !== state)
        {
            switch(this.state)
            {
                case GameStates.CHARACTER_LOBBY: this.emit('leave_character_lobby'); break;
                case GameStates.INGAME: this.emit('leave_game'); break;
            }

            this.state = state;

            switch(this.state)
            {
                case GameStates.CHARACTER_LOBBY: this.emit('enter_character_lobby'); break;
                case GameStates.INGAME: this.emit('enter_game'); break;
            }
        }
    }

    setLoadingScreen(isInLoadingScreen)
    {
        if(this.isInLoadingScreen !== isInLoadingScreen)
        {
            this.isInLoadingScreen = isInLoadingScreen;
            this.emit(isInLoadingScreen ? 'enter_loading_screen' : 'leave_loading_screen');
        }
    }

    get isIngame() { return this.state === GameStates.INGAME; }
}


// TODO FIXME: remove this ugly-ass shit code once mods are ported to new require() stuff.
if(!global.__TeraGameStateInstanceMap__)
    global.__TeraGameStateInstanceMap__ = new WeakMap();

module.exports = function TeraGameStateLoader(mod) {
    if(mod.name !== 'tera-game-state')
        console.log(`WARNING FOR DEVELOPERS: In ${mod.name} - require()'ing tera-game-state is deprecated, use mod.game instead!`);

	if(global.__TeraGameStateInstanceMap__.has(mod.dispatch))
        return global.__TeraGameStateInstanceMap__.get(mod.dispatch)

	const instance = new TeraGameState(mod)
	global.__TeraGameStateInstanceMap__.set(mod.dispatch, instance)
	return instance
}
