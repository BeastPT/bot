const { PrismaClient } = require('@prisma/client');
const I18n = require('@eartharoid/i18n');
const ListenerLoader = require('./modules/listeners/loader');
const CommandManager = require('./modules/commands/manager');
const {
	Client: DiscordClient,
	LimitedCollection,
	Options,
	Intents
} = require('discord.js');
const { presences } = require('../config');

class Client extends DiscordClient {
	constructor(options) {
		super(options);
		this.log = require('./logger/child');

		/** @type {PrismaClient} */
		this.prisma = new PrismaClient();

		/** @type {I18n} */
		this.i18n = new I18n('en-GB', require('./locales')());

		const listeners = new ListenerLoader(this);
		listeners.load();

		/** @type {CommandManager} */
		this.commands = new CommandManager(this);
		this.login();
	}
}

const client = new Client({
	intents: [
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_WEBHOOKS,
		Intents.FLAGS.GUILDS
	],
	makeCache: Options.cacheWithLimits({
		GuildBanManager: 0,
		GuildEmojiManager: 0,
		GuildInviteManager: 0,
		GuildMemberManager: LimitedCollection.filterByLifetime({
			excludeFromSweep: member => member.id === member.client.user.id,
			lifetime: 360
		}),
		GuildStickerManager: 0,
		MessageManager: 0,
		PresenceManager: 0,
		ReactionManager: 0,
		ReactionUserManager: 0,
		ThreadManager: 0,
		UserManager: 0,
		VoiceStateManager: 0
	}),
	presence: { activities: [presences[Math.floor(Math.random() * presences.length)]] }
});


process.on('unhandledRejection', error => {
	client.log.warn('An error was not caught');
	client.log.error(error);
});

module.exports = Client;