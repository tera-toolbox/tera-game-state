const EventEmitter = require('events');

class Me extends EventEmitter
{
    constructor(parent)
    {
        super();
        this.setMaxListeners(0);

        this.parent = parent;

        // TODO: check if we're not ingame. if we are, fail!

        this.reset();
        this.installHooks();
    }

    destructor()
    {
        this.reset();
        this.parent = undefined;
    }

    installHook(name, version, cb)
    {
        this.parent.mod.hook(name, version, {order: -10000, filter: {fake: null, modified: null, silenced: null}}, cb);
    }

    installHooks()
    {
        this.installHook('S_LOGIN', this.parent.mod.majorPatchVersion >= 81 ? 13 : 12, (event) => {
            this.gameId = event.gameId;
            this.templateId = event.templateId;
            this.playerId = event.playerId;

            // Cache some stuff
            this.class = this.parent.data.user[this.templateId].class;
            this.race = this.parent.data.user[this.templateId].race;
            this.gender = this.parent.data.user[this.templateId].gender;

            this.setName(event.name);
            this.setLevel(event.level);
            this.setStatus(event.status);
            this.setAlive(event.alive);
        });

        this.installHook('S_LOAD_TOPO', 3, (event) => {
            this.setMount(null, null);
            this.setZone(event.zone, event.quick);
        });

        this.installHook('S_SPAWN_ME', 3, (event) => {
            this.setAlive(event.alive);
        });

        this.installHook('S_CREATURE_LIFE', 2, (event) => {
            if(this.is(event.gameId))
                this.setAlive(event.alive);
        });

        this.installHook('S_MOUNT_VEHICLE', 2, (event) => {
            if(this.is(event.gameId))
                this.setMount(event.id, event.skill);
        });

        this.installHook('S_UNMOUNT_VEHICLE', 2, (event) => {
            if(this.is(event.gameId))
                this.setMount(null, null);
        });

        this.installHook('S_USER_CHANGE_NAME', 1, (event) => {
            if(this.is(event.gameId))
                this.setName(event.name);
        });

        this.installHook('S_USER_LEVELUP', 2, (event) => {
            if (this.is(event.gameId))
                this.setLevel(event.level);
        })

        this.installHook('S_USER_STATUS', 2, (event) => {
            if(this.is(event.gameId))
                this.setStatus(event.status);
        });

        this.installHook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, (event) => {
            this._currentBattlegroundZone = event.zone;
        });

        this.parent.on('leave_game', () => { this.reset(); });
    }

    is(gameId)
    {
        return (this.gameId && this.gameId === gameId);
    }

    setZone(zone, quick)
    {
        if(this.zone !== zone)
        {
            this.zone = zone;
            this.emit('change_zone', zone, quick);
        }
    }

    setAlive(alive)
    {
        if(this.alive !== alive)
        {
            let old_alive = this.alive;
            this.alive = alive;

            if(old_alive !== null)
                this.emit(alive ? 'resurrect' : 'die');
        }
    }

    setMount(id, skill)
    {
        if(this.mountId !== id || this.mountSkill !== skill)
        {
            this.mountId = id;
            this.mountSkill = skill;

            if(this.mounted)
                this.emit('mount', id, skill);
            else
                this.emit('dismount');
        }
    }

    get mounted() { return !!this.mountId; }

    setName(name)
    {
        if(this.name !== name)
        {
            let old_name = this.name;
            this.name = name;

            if(old_name !== null)
                this.emit('change_name', name);
        }
    }

    setLevel(level)
    {
        if(this.level !== level)
        {
            let old_level = this.level;
            this.level = level

            if(old_level !== null)
                this.emit('change_level', level);
        }
    }

    setStatus(status)
    {
        if(this.status !== status)
        {
            let old_status = this.status;
            this.status = status;

            switch(old_status)
            {
                case 1: this.emit('leave_combat'); break;
                case 3: this.emit('finish_pegasus'); break;
            }

            switch(status)
            {
                case 1: this.emit('enter_combat'); break;
                case 3: this.emit('start_pegasus'); break;
            }
        }
    }

    get inCombat() { return (this.status === 1); }
    get onPegasus() { return (this.status === 3); }
    get inBattleground() { return this.zone && this._currentBattlegroundZone && (this.zone === this._currentBattlegroundZone); }
    get serverId() { return this.parent.serverId; }

    reset()
    {
        this.gameId = null;
        this.templateId = null;
        this.playerId = null;
        this.name = null;
        this.level = null;
        this.class = null;
        this.race = null;
        this.gender = null;
        this.zone = null;
        this.alive = null;
        this.mountId = null;
        this.mountSkill = null;
        this.status = null;
        this._currentBattlegroundZone = null;
    }
}

module.exports = Me;
