class Party {
	constructor(parent) {
		//super();
		//this.setMaxListeners(0);

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
		return this.parent.mod.hook(name, version, { order: -10000, filter: { fake: null, modified: null, silenced: null } }, cb);
	}

	installHooks() {
		this.parent.on('enter_game', () => { this.reset(); });
		this.parent.on('leave_game', () => { this.reset(); });

		this.installHook('S_PARTY_MEMBER_LIST', 7, event => {
			this.partyMembers = [];
			event.members.forEach(member => {
				if (!(this.parent.me.is(event.gameId)))
					this.partyMembers.push({ "gameId": member.gameId, "playerId": member.playerId, "serverId": member.serverId });
			});
			//TODO: add event
		});

		this.installHook('S_LEAVE_PARTY_MEMBER', 2, event => {
			this.partyMembers = this.partyMembers.filter(elem => elem.playerId !== event.playerId && elem.serverId !== event.playerId);
			//TODO: add event
		});

		this.installHook('S_BAN_PARTY_MEMBER', 1, event => {
			this.partyMembers = this.partyMembers.filter(elem => elem.playerId !== event.playerId && elem.serverId !== event.playerId);
			//TODO: add event
		});

		this.installHook('S_LEAVE_PARTY', "event", () => {
			this.partyMembers = [];
			//TODO: add event
		});

		//Bugfix for p97+ issues by BHS
		this.installHook('S_SPAWN_USER', 15 , event => {
			for (let i = 0; i < this.partyMembers.length; i++) {
				if(this.partyMembers[i].serverId === event.serverId && this.partyMembers[i].playerId === event.playerId) {
					this.partyMembers[i].gameId = event.gameId;
				}
			}
		});
	}

	reset() {
		this.partyMembers = [];
	}

	isPartyMember(gameId) {
		for (let i = 0; i < this.partyMembers.length; i++) {
			if (this.partyMembers[i].gameId === gameId) return true;
		}
		return false;
	}

	inParty() {
		return this.partyMembers.length > 0;
	}
}

module.exports = Party;
