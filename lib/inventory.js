const EventEmitter = require('events');

class Inventory extends EventEmitter
{
    constructor(parent)
    {
        super();
        this.setMaxListeners(0);

        this.parent = parent;
        this.parent.initialize("me");

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
        this.parent.on('enter_game', () => { this.reset(); });
        this.parent.on('leave_game', () => { this.reset(); });

        this.installHook('S_INVEN', 18, (event) => {
            if (!this.parent.me.is(event.gameId))
                return;

            if (event.first)
                this._buffer = event;
            else
                this._buffer.items = this._buffer.items.concat(event.items);

            if (!event.more) {
                // Load money etc.
                this.bagSize = this._buffer.size;
                this.equipmentItemLevel = this._buffer.itemLevel;
                this.totalItemLevel = this._buffer.itemLevelInventory;
                this.money = this._buffer.gold;
                this.tcat = this._buffer.tcat;

                // Load items
                this.slots = {};
                this.dbids = {};
                this._buffer.items.forEach(item => {
                    // Add item to lists
                    this.slots[item.slot] = item;
                    this.dbids[item.dbid] = item;
                });

                this._buffer = null;
            }
        });
    }

    reset()
    {
        this._buffer = null;
        this.slots = {};
        this.dbids = {};
        this.bagSize = null;
        this.equipmentItemLevel = null;
        this.totalItemLevel = null;
        this.money = null;
        this.tcat = null;
    }

    isSlot(slot)
    {
        return this.isEquipmentSlot(slot) || this.isBagSlot(slot);
    }

    isEquipmentSlot(slot)
    {
        return slot > 0 && slot < 40;
    }

    isBagSlot(slot)
    {
        return slot >= 40 && slot < 40 + this.bagSize;
    }

    get items()
    {
        return Object.values(this.slots);
    }

    get equipment()
    {
        return Object.values(this.slots).filter(item => this.isEquipmentSlot(item.slot));
    }

    get bag()
    {
        return Object.values(this.slots).filter(item => this.isBagSlot(item.slot));
    }

    getTotalAmount(id)
    {
        if (Array.isArray(id))
            return this.items.reduce((amount, item) => id.includes(item.id) ? amount + item.amount : amount, 0);
        else
            return this.items.reduce((amount, item) => (item.id === id) ? amount + item.amount : amount, 0);
    }

    getTotalAmountInEquipment(id)
    {
        if (Array.isArray(id))
            return this.equipment.reduce((amount, item) => id.includes(item.id) ? amount + item.amount : amount, 0);
        else
            return this.equipment.reduce((amount, item) => (item.id === id) ? amount + item.amount : amount, 0);
    }

    getTotalAmountInBag(id)
    {
        if (Array.isArray(id))
            return this.bag.reduce((amount, item) => id.includes(item.id) ? amount + item.amount : amount, 0);
        else
            return this.bag.reduce((amount, item) => (item.id === id) ? amount + item.amount : amount, 0);
    }

    find(id)
    {
        if (Array.isArray(id))
            return this.items.find(item => id.includes(item.id));
        else
            return this.items.find(item => item.id === id);
    }

    findInEquipment(id)
    {
        if (Array.isArray(id))
            return this.equipment.find(item => id.includes(item.id));
        else
            return this.equipment.find(item => item.id === id);
    }

    findInBag(id)
    {
        if (Array.isArray(id))
            return this.bag.find(item => id.includes(item.id));
        else
            return this.bag.find(item => item.id === id);
    }

    findAll(id)
    {
        if (Array.isArray(id))
            return this.items.filter(item => id.includes(item.id));
        else
            return this.items.filter(item => item.id === id);
    }

    findAllInEquipment(id)
    {
        if (Array.isArray(id))
            return this.equipment.filter(item => id.includes(item.id));
        else
            return this.equipment.filter(item => item.id === id);
    }

    findAllInBag(id)
    {
        if (Array.isArray(id))
            return this.bag.filter(item => id.includes(item.id));
        else
            return this.bag.filter(item => item.id === id);
    }

    get equipmentPassivities()
    {
        let res = [];
        this.equipment.forEach(item => {
            const activePassivities = item.passivitySets[item.passivitySet];
            if (activePassivities) {
                for (let passivity of activePassivities.passivities) {
                    if (passivity.id !== 0)
                        res.push(passivity.id);
                }
            }

            res = res.concat(item.mergedPassivities);
        });

        return res;
    }

    get equipmentCrystals()
    {
        let res = [];
        this.equipment.forEach(item => {
            if (item.crystal1 !== 0)
                res.push(item.crystal1);
            if (item.crystal2 !== 0)
                res.push(item.crystal2);
            if (item.crystal3 !== 0)
                res.push(item.crystal3);
            if (item.crystal4 !== 0)
                res.push(item.crystal4);
            if (item.crystal5 !== 0)
                res.push(item.crystal5);
        });

        return res;
    }

    get weaponEquipped()
    {
        return !!this.slots[1];
    }
}

module.exports = Inventory;
