const { Message } = require('discord.js');
const EventListener = require('../modules/listeners/listener');

module.exports = class MessageCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'messageCreate' });
	}

	/**
	 * @param {Message} message
	 */
	async execute(message) {
		if (message.author.bot) return;

		const is_owner = message.author.id === process.env.OWNER;

		if (is_owner && message.content.startsWith(`<@${this.client.user.id}> sync`)) {
			const guild = message.content.split(' ')[2];
			if (guild) this.client.commands.publish(guild);
			else this.client.commands.publish();
			message.reply('ok');
		} else if (is_owner && message.content.startsWith(`<@${this.client.user.id}> testdb`)) {
			let user = await this.client.prisma.user.findUnique({ where: { id: message.author.id } });
			if (!user) {
				await this.client.prisma.user.create({
					data: {
						id: message.author.id,
					}
				});
			}

			this.client.log.debug('Test DB');
		} else {
			const regex = new RegExp(`^(x!)|(<@!?${this.client.user.id}>)`, 'i');
			if (!regex.test(message.content) && message.channel.type !== 'DM') return;
	
			this.client.log.info(`Received message from ${message.author.tag}`);
	
			message.reply('BOT MIGRATE')
				.catch(() => message.channel.send('BOT MIGRATE')
					.catch(error => this.client.log.error(error)));
		}

	}
};