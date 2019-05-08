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
        this.language = null;
        this.accountId = null;
        this.accountName = null;
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
                    this.mod.error(`Unable to load submodule ${submodule}:`);
                    this.mod.error(e);
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
        this.installHook('C_LOGIN_ARBITER', 2, event => {
            this.language = event.language;
            this.accountName = event.name;
        });
        this.installHook('S_LOGIN_ACCOUNT_INFO', 2, event => {
            this.accountId = event.accountId;
        });

        this.installHook('S_GET_USER_LIST', 'raw', () => { this.setState(GameStates.CHARACTER_LOBBY); });
        this.installHook('S_RETURN_TO_LOBBY', 'raw', () => { this.setState(GameStates.CHARACTER_LOBBY); });
        this.installHook('S_LOGIN', 'raw', () => { this.setLoadingScreen(true); this.setState(GameStates.INGAME); });
        this.installHook('S_LOAD_TOPO', 'raw', () => { this.setLoadingScreen(true); });
        this.installHook('S_SPAWN_ME', 'raw', () => { this.setLoadingScreen(false); });
        this.installHook('S_EXIT', 'raw', () => { this.setState(GameStates.INVALID); });
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
    get serverId() { return this.mod.serverId; }
}

module.exports = TeraGameState;
