const EventEmitter = require('events');

class Inventory extends EventEmitter {
    constructor(parent) {
        super();
        this.setMaxListeners(0);

        this.parent = parent;
        this.parent.initialize('me');

        // TODO: check if we're not ingame. if we are, fail!

        this.reset();
        this.installHooks();
    }

    destructor() {
        this.reset();
        this.parent = undefined;
    }

    installHook(name, version, cb) {
        this.parent.mod.hook(name, version, { order: -10000, filter: { fake: null, modified: null, silenced: null } }, cb);
    }

    installHooks() {
        this.parent.on('enter_game', () => { this.reset(); });
        this.parent.on('leave_game', () => { this.reset(); });

        this.installHook('S_INVEN', 19, (event) => {
            if (!this.parent.me.is(event.gameId))
                return;

            if (event.first)
                this._buffer = event;
            else
                this._buffer.items = this._buffer.items.concat(event.items);

            if (!event.more) {
                // Load money etc.
                this.pocketCount = 1;
                this.pockets[0] = {
                    size: this._buffer.size,
                    lootPriority: 0,
                    slots: {}
                };

                this.equipment = {
                    size: 40,
                    slots: {}
                };

                this.equipmentItemLevel = this._buffer.itemLevel;
                this.totalItemLevel = this._buffer.itemLevelInventory;
                this.money = this._buffer.gold;
                this.tcat = this._buffer.tcat;

                // Load items
                this.dbids = {};
                this._buffer.items.forEach(item => {
                    // Convert crystals to array
                    item.crystals = [];
                    if (item.crystal1 !== 0)
                        item.crystals.push(item.crystal1);
                    delete item.crystal1;

                    if (item.crystal2 !== 0)
                        item.crystals.push(item.crystal2);
                    delete item.crystal2;

                    if (item.crystal3 !== 0)
                        item.crystals.push(item.crystal3);
                    delete item.crystal3;

                    if (item.crystal4 !== 0)
                        item.crystals.push(item.crystal4);
                    delete item.crystal4;

                    if (item.crystal5 !== 0)
                        item.crystals.push(item.crystal5);
                    delete item.crystal5;

                    // Add to lists
                    item.data = this.parent.data.items.get(item.id);
                    if (item.slot < 40) {
                        item.container = 14;
                        item.pocket = 0;
                        this.equipment.slots[item.slot] = item;
                    } else {
                        item.container = 0;
                        item.pocket = 0;
                        item.slot -= 40;
                        this.pockets[0].slots[item.slot] = item;
                    }
                    this.dbids[item.dbid] = item;
                });

                this._buffer = null;
                this.emit('update');
            }
        });
    }

    reset() {
        this._buffer = null;
        this.dbids = {};
        this.equipmentItemLevel = null;
        this.totalItemLevel = null;
        this.money = null;
        this.tcat = null;
        this.pocketCount = 0;
        this.pockets = [];
    }

    get bag() {
        return this.pockets[0];
    }

    get items() {
        return Object.values(this.dbids);
    }

    get equipmentItems() {
        return Object.values(this.equipment.slots);
    }

    get bagItems() {
        return Object.values(this.bag.slots);
    }

    getTotalAmount(id) {
        if (Array.isArray(id))
            return this.items.reduce((amount, item) => id.includes(item.id) ? amount + item.amount : amount, 0);
        else
            return this.items.reduce((amount, item) => (item.id === id) ? amount + item.amount : amount, 0);
    }

    getTotalAmountInEquipment(id) {
        if (Array.isArray(id))
            return this.equipmentItems.reduce((amount, item) => id.includes(item.id) ? amount + item.amount : amount, 0);
        else
            return this.equipmentItems.reduce((amount, item) => (item.id === id) ? amount + item.amount : amount, 0);
    }

    getTotalAmountInBag(id) {
        if (Array.isArray(id))
            return this.bagItems.reduce((amount, item) => id.includes(item.id) ? amount + item.amount : amount, 0);
        else
            return this.bagItems.reduce((amount, item) => (item.id === id) ? amount + item.amount : amount, 0);
    }

    find(id) {
        if (Array.isArray(id))
            return this.items.find(item => id.includes(item.id));
        else
            return this.items.find(item => item.id === id);
    }

    findInEquipment(id) {
        if (Array.isArray(id))
            return this.equipmentItems.find(item => id.includes(item.id));
        else
            return this.equipmentItems.find(item => item.id === id);
    }

    findInBag(id) {
        if (Array.isArray(id))
            return this.bagItems.find(item => id.includes(item.id));
        else
            return this.bagItems.find(item => item.id === id);
    }

    findAll(id) {
        if (Array.isArray(id))
            return this.items.filter(item => id.includes(item.id));
        else
            return this.items.filter(item => item.id === id);
    }

    findAllInEquipment(id) {
        if (Array.isArray(id))
            return this.equipmentItems.filter(item => id.includes(item.id));
        else
            return this.equipmentItems.filter(item => item.id === id);
    }

    findAllInBag(id) {
        if (Array.isArray(id))
            return this.bagItems.filter(item => id.includes(item.id));
        else
            return this.bagItems.filter(item => item.id === id);
    }

    get equipmentPassivities() {
        let res = [];
        this.equipmentItems.forEach(item => {
            const activePassivities = item.passivitySets[item.passivitySet];
            if (activePassivities)
                res = res.concat(activePassivities.passivities.filter(passivity => passivity !== 0));
            res = res.concat(item.mergedPassivities);
        });

        return res;
    }

    get equipmentCrystals() {
        let res = [];
        this.equipmentItems.forEach(item => {
            res = res.concat(item.crystals.filter(crystal => crystal !== 0));
        });

        return res;
    }

    get weaponEquipped() {
        return !!this.equipment.slots[1];
    }
}

module.exports = Inventory;
