# party
Submodule tracking current player party

**You need to specifically request this submodule during your module's initialization by calling `mod.game.initialize`!**

# Functions
## isPartyMember
- Returns true/false
- Exemplary usage: `mod.game.party.isPartyMember(<gameId>)`

## inParty
- Returns true/false
- Exemplary usage: `mod.game.party.inParty()`

# Events
## party_list
- Emitted when S_PARTY_MEMBER_LIST received AND party list WAS FIXED
- Exemplary usage: `mod.game.party.on('party_lists', (list) => { ... })`
- Parameters: `list` is array of objects with content { gameId..., playerId:... , serverId:..., name: ..., class: ... }

## party_member_leave
- Emitted when S_LEAVE_PARTY_MEMBER received
- Exemplary usage: `mod.game.party.on('party_member_leave', (obj) => { ... })`
- Parameters: `obj` is object { playerId:... , serverId:..., name: ..., class: ... }

## party_member_kick
- Emitted when S_BAN_PARTY_MEMBER received
- Exemplary usage: `mod.game.party.on('party_member_kick', (obj) => { ... })`
- Parameters: `obj` is object { playerId:... , serverId:..., name: ..., class: ... }

## party_left
- Emitted when S_LEAVE_PARTY received
- Exemplary usage: `mod.game.party.on('party_left', () => { ... })`
- Parameters: not included

