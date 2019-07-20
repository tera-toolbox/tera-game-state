# inventory
Submodule representing the player's inventory (equipment, bag, and pockets). Accessible through `mod.game.inventory`.

**You need to specifically request this submodule during your module's initialization by calling `mod.game.initialize`!**

# Functions
## getTotalAmount
- Returns the total amount of items with the given ID (or array of IDs) in both equipment and bag combined.
- Exemplary usage: `mod.game.inventory.getTotalAmount(CONSUMABLE_ID)`

## getTotalAmountInEquipment
- Returns the total amount of equipped items with the given ID (or array of IDs).
- Exemplary usage: `mod.game.inventory.getTotalAmountInEquipment(CONSUMABLE_ID)`

## getTotalAmountInBag
- Returns the total amount of bag items with the given ID (or array of IDs).
- Exemplary usage: `mod.game.inventory.getTotalAmountInBag(CONSUMABLE_ID)`

## find
- Returns the first item with the given ID (or array of IDs) found in both equipment and bag combined.
- Exemplary usage: `mod.game.inventory.find(CONSUMABLE_ID)`

## findInEquipment
- Returns the first equipped item found with the given ID (or array of IDs).
- Exemplary usage: `mod.game.inventory.findInEquipment(CONSUMABLE_ID)`

## findInBag
- Returns the first bag item found with the given ID (or array of IDs).
- Exemplary usage: `mod.game.inventory.findInBag(CONSUMABLE_ID)`

## findAll
- Returns all items with the given ID (or array of IDs) in both equipment and bag combined.
- Exemplary usage: `mod.game.inventory.findAll(CONSUMABLE_ID).forEach(item => ...)`

## findAllInEquipment
- Returns all equipped items with the given ID (or array of IDs).
- Exemplary usage: `mod.game.inventory.findAllInEquipment(CONSUMABLE_ID).forEach(item => ...)`

## findAllInBag
- Returns all bag items with the given ID (or array of IDs).
- Exemplary usage: `mod.game.inventory.findAllInBag(CONSUMABLE_ID).forEach(item => ...)`

# Attributes
Each of the following attributes can be accessed through, for example, `mod.game.inventory.money`.
- `dbids`: DatabaseID -> Item object containing all items (equipment, bag, pockets)
- `items`: array containing all items in equipment and bag combined
- `pocketCount`: total number of unlocked pockets + 1 (as the bag is regarded to as pocket 0)
- `pockets`: array (index 0 = bag; index 1 = first pocket; etc.) of objects with `size` (number of slots), `lootPriority` (see `S_ITEMLIST` definition) and `slots` (slot number -> item object; contains only used slots)
- `equipment`: object with `size` (number of slots) and `slots` (slot number -> item object; contains only used slots)
- `equipmentItems`: array containing all equipped items
- `bag`: redirects to `pockets[0]`
- `bagItems`: array containing all items in bag
- `equipmentItemLevel`: Currently equipped item level
- `totalItemLevel`: Maximum possible item level across all items in equipment and bag
- `money`: Total money
- `tcat`: Total TCat
- `equipmentPassivities`: array containing all passivity IDs of the currently active passivity sets of all equipped items (e.g. weapon rolls). Duplicates possible.
- `equipmentCrystals`: array containing all item IDs of the crystals in all equipped items. Duplicates possible.
- `weaponEquipped`: Indicates whether or not a weapon is equipped

# Events
## update
- Emitted whenever a full batch of update packets has been received, stitched together, and parsed.
- Exemplary usage: `mod.game.inventory.on('update', () => { ... })`
- Parameters: none

# Exemplary Usage
```js
// Log info about all items in equipment and bag
mod.log('--- Equipment ---')
mod.game.inventory.equipmentItems.forEach(item => {
    mod.log(`Slot ${item.slot}: ${item.data.name} x${item.amount} (ID: ${item.id})`);
});
mod.log('--- Bag ---')
mod.game.inventory.bagItems.forEach(item => {
    mod.log(`Slot ${item.slot}: ${item.data.name} x${item.amount} (ID: ${item.id})`);
});
```
