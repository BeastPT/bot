//const { colour } = require('../../../config');
const Command = require('../../modules/commands/command');
const {
	CommandInteraction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			description: 'List the available commands (and links to documentation)',
			name: 'help'
		});
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {

		return await interaction.editReply('This command is under creation.');
	}
};