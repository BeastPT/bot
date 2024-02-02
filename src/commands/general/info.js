const { colour } = require('../../../config');
const Command = require('../../modules/commands/command');
const {
	CommandInteraction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class AboutCommand extends Command {
	constructor(client) {
		super(client, {
			description: 'Get information and statistics about the bot',
			name: 'info'
		});
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		return await interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor(colour)
					.setTitle('This command is under creation.')
					.setDescription('WIP')
			]
		});
	}
};