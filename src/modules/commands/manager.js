const { colour } = require('../../../config');
const {
	CommandInteraction,	// eslint-disable-line no-unused-vars
	Collection,
	MessageEmbed
} = require('discord.js');
const {
	readdirSync,
	statSync
} = require('fs');
const { randomUUID } = require('crypto');

module.exports = class CommandManager {
	/**
	 * @param {import('../../bot')} client
	 */
	constructor(client) {
		this.client = client;

		/**
		 * @type {Collection<string, import('./command')>}
		 */
		this.commands = new Collection();
	}

	load() {
		const getFiles = (path, acc) => {
			if (!acc) acc = [];
			const files = readdirSync(path);
			files.forEach(file => {
				if (!file.startsWith('--')) {
					if (statSync(`${path}/${file}`).isDirectory()) acc = getFiles(`${path}/${file}`, acc);
					else if (file.endsWith('.js')) acc.push(`${path}/${file}`);
				}
			});

			return acc;
		};
		const files = getFiles('./src/commands');

		for (const file of files) {
			const parts = file.split('/');
			let category = parts[parts.length - 2];
			if (category === 'commands') category = null;
			try {
				this.client.log.info(`Loading command "${file}"`)
				const Command = require(`../../../${file}`);
				const command = new Command(this.client);
				command.category = category;
				this.commands.set(command.name, command);
			} catch (error) {
				this.client.log.warn('An error occurred whilst loading a command');
				this.client.log.error(error);
			}
		}
	}

	async publish(guild) {
		try {
			const commands = this.client.commands.commands.map(command => command.toJSON());
			if (guild) await this.client.application.commands.set(commands, guild);
			else await this.client.application.commands.set(commands);
			this.client.log.success(`Published ${this.client.commands.commands.size} commands`);
		} catch (error) {
			this.client.log.warn('An error occurred whilst publishing the commands');
			this.client.log.error(error);
		}
	}

	/**
	 * @param {CommandInteraction} interaction
	 */
	async handle(interaction) {
		
		const command = this.commands.get(interaction.commandName);
		if (!command) return;

		if (command.defer !== false) await interaction.deferReply({ ephemeral: command.ephemeral ?? false });

		if (command.guild_only && !interaction.guild) {
			return await interaction[command.defer ? 'editReply' : 'reply']({
				embeds: [
					new MessageEmbed()
						.setColor(colour)
						.setTitle('GUILD ONLY')
						.setDescription('hello')
						.setFooter('FOOTER', this.client.user.avatarURL())
				]
			});
		}

		if (interaction.guild) {
			const missing_roles = command.roles instanceof Array && !command.roles.some(role => interaction.member.roles.cache.has(role));
			if ((missing_permissions || missing_roles ) && interaction.user.id !== process.env.OWNER) { // let me bypass permissions check ;)
				const permissions = command.permissions.map(p => `\`${p}\``).join(', ');
				return await interaction[command.defer ? 'editReply' : 'reply']({
					embeds: [
						new MessageEmbed()
							.setColor(colour)
							.setTitle('MISSING PERMISSIONS')
							.setDescription({ permissions })
							.setFooter('FOOTER', this.client.user.avatarURL())
					],
					ephemeral: true
				});
			}
		}

		try {
			this.client.log.info(`Executing "${command.name}" command (invoked by ${interaction.user.tag})`);
			await command.execute(interaction);
		} catch (error) {
			const uuid = randomUUID();
			this.client.log.warn(`An error occurred whilst executing the ${command.name} command`);
			this.client.log.error(uuid);
			this.client.log.error(error);
			await interaction[command.defer ? 'editReply' : 'reply']({
				embeds: [
					new MessageEmbed()
						.setColor(colour)
						.setTitle('COMMAND EXECUTION ERROR')
						.setDescription('An error occurred whilst executing the command. Please try again later. If this issue persists, please contact the bot owner.')
						.addField('IDENTIFIER', `\`\`\`\n${uuid}\n\`\`\``)
						.setFooter('FOOTER', this.client.user.avatarURL())
				],
				ephemeral: true
			});
		}
	}

};
