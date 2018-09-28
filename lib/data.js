class Data
{
    constructor(parent)
    {
        this.parent = parent;

        this.user = require('./res/userdata.json');
    }

    destructor()
    {
        this.parent = undefined;
    }
}

module.exports = Data;
