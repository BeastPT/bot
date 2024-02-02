const { colour } = require('../../config');
const EventListener = require('../modules/listeners/listener');
const {
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	WebhookClient
} = require('discord.js');

module.exports = class InteractionCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'interactionCreate' });
	}

	/**
	 * @param {import('discord.js').ModalSubmitInteraction} interaction
	 */
	async execute(interaction) {
		if (interaction.isCommand()) {
			this.client.commands.handle(interaction);
		} else if (interaction.isAutocomplete()) {
			this.client.autocomplete.complete(interaction);
		} else if (interaction.isButton()) {
			const id = interaction.customId.split(';');

			/* if (id[0] === 'joke') {
				// etc
			} */
		} else if (interaction.isModalSubmit()) {
			await interaction.deferReply();
			const id = interaction.customId.split(';');

			/* if (id[0] === 'suggestion') {
				// etc
			} */
		}
	}
};