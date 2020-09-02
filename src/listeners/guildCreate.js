/**
 * @name christmascountdownbot
 * @author eartharoid <contact@eartharoid.me>
 * @copyright 2020 Isaac Saunders (eartharoid)
 * @license GPL-3.0
 */

const { Listener } = require('discord-akairo');
const { ChildLogger } = require('leekslazylogger');
const log = new ChildLogger();

class OnGuildCreateListener extends Listener {
	constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: 'guildCreate'
		});
	}

	exec(guild) {
		const { client } = this;

		client.shard.fetchClientValues('guilds.cache.size').then(total => {
			log.success(`${global.prefix} Added to '${guild.name}' (${client.guilds.cache.size}/${total})`);
		});
		
		client.db.Guild.create(require('../models/guild').defaults(guild));

	}
}

module.exports = OnGuildCreateListener;