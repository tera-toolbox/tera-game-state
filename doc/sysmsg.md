# sysmsg
Submodule representing the incoming system message. Accessible through `mod.game.sysmsg`.

# Functions
None

# Events
## update
- Emitted when a new system messages arrives on `S_SYSTEM_MESSAGE`.
- Exemplary usage: `mod.game.sysmsg.on('update', (id, tokens) => { ... })`
- Parameters: `id` is id of the system message, and `tokens` is the tokens associated with the system message