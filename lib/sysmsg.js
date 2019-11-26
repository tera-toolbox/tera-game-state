const EventEmitter = require('events');

class Sysmsg extends EventEmitter {

  constructor(parent) {
    super();
    this.setMaxListeners(0);

    this.parent = parent;

    this.reset();
    this.installHooks();
  }

  destructor() {
    this.reset();
    this.parent = undefined;
  }

  installHook(name, version, cb) {
    return this.parent.mod.hook(name, version, { order: -10000, filter: { fake: null, modified: null, silenced: null } }, cb);
  }

  installHooks() {
    this.parent.on('leave_game', () => { this.reset(); });

    this.installHook('S_SYSTEM_MESSAGE', 1, (event) => {
      let msg = this.parent.mod.parseSystemMessage(event.message);
      this.id = msg.id;
      this.tokens = msg.tokens;

      this.emit('update', msg.id, msg.tokens);
    });
  }

  reset() {
    this.id = null;
    this.tokens = null;
  }

}

module.exports = Sysmsg;
