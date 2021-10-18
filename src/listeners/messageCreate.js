const { Message } = require('discord.js'); // eslint-disable-line no-unused-vars
const EventListener = require('../modules/listeners/listener');

module.exports = class MessageCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'messageCreate' });
	}

	/**
	 * @param {Message} message
	 */
	async execute(message) {
		const is_owner = message.author.id === process.env.OWNER;
		if (is_owner && message.content.startsWith('x!sync')) {
			const guild = message.content.split(' ')[1];
			if (guild) this.client.commands.publish(guild);
			else this.client.commands.publish();
		} else {
			const regex = new RegExp(`^(x!)|(<@!?${this.client.user.id}>)`, 'i');
			if (!regex.test(message.content) && message.channel.type !== 'DM') return;

			this.client.log.info(`Received message from ${message.author.tag}`);

			const u_settings = await this.client.prisma.user.findUnique({ where: { id: message.author.id } });
			const g_settings = message.guild && await this.client.prisma.guild.findUnique({ where: { id: message.guild.id } });
			const i18n = this.client.i18n.getLocale(u_settings?.locale ?? g_settings?.locale);

			try {
				message.reply(i18n('bot.migrate'));
			} catch (error) {
				this.client.log.error(error);
			}
		}
	}
};