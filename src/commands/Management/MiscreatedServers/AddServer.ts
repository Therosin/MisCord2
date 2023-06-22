// Copyright (C) 2022 Theros < MisModding | SvalTek >
// 
// This file is part of MisCord2.
// 
// MisCord2 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// MisCord2 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with MisCord2.  If not, see <http://www.gnu.org/licenses/>.

import { ApplyOptions } from '@sapphire/decorators';
import { Command } from "@sapphire/framework";
import type { ModalSubmitInteraction } from 'discord.js';
import { CreateModel } from '../../../lib/discord-utils';
import { MessageEmbed } from 'discord.js';
//import { container } from '@sapphire/framework';

import { CreateServerForGuild } from '../../../database/DatabaseUtils';


@ApplyOptions<Command.Options>({
	name: 'AddServer',
	description: 'Add a server to manage',

})
export class AddMiscreatedServerCommand extends Command {
	// Register slash command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}

	async chatInputRun(interaction: Command.ChatInputInteraction) {
		// Create the modal
		const AddServerModel = CreateModel(interaction.guildId as string, this.name, 'Add Server', {
			fields: [
				{
					name: 'Server Name',
					label: 'Server Name',
					placeholder: 'My Server',
					required: true
				},
				{
					name: 'Server Hostname',
					label: 'Server Hostname',
					placeholder: 'server hostname or ip',
					required: true,
					minLength: 8,
					maxLength: 75,
				},
				{
					name: 'Server GamePort',
					label: 'Server Game Port',
					placeholder: 'server gameport eg: 64090',
					required: true,
					minLength: 4,
					maxLength: 6,
				},
				{
					name: 'Server RconPort',
					label: 'Server rcon Port',
					placeholder: 'server rconport eg: 64094',
					required: true,
					minLength: 4,
					maxLength: 6,
				},
				{
					name: 'Server RconPassword',
					label: 'Server rcon Password',
					placeholder: 'server rconpassword',
					required: false,
					minLength: 4,
					maxLength: 75,
				},
			],
		})

		// Send the modal
		return await interaction.showModal(AddServerModel);
	}

	// Triggered on the modal submit
	async modalRun(interaction: ModalSubmitInteraction) {
		const guildId = interaction.customId.split('--')[1];
		const serverName = interaction.fields.getTextInputValue('server-name');
		const serverHostname = interaction.fields.getTextInputValue('server-hostname');
		const serverGamePort = interaction.fields.getTextInputValue('server-gameport');
		const serverRconPort = interaction.fields.getTextInputValue('server-rconport');
		const serverRconPassword = interaction.fields.getTextInputValue('server-rconpassword');

		try {
			const new_server = await CreateServerForGuild(guildId,{
				Name: serverName,
				Host: serverHostname,
				GamePort: parseInt(serverGamePort),
				RconPort: parseInt(serverRconPort),
				RconPassword: serverRconPassword,
			} as any);

			// if server was created, return success
			if (new_server && new_server.id) {
				const embed = new MessageEmbed()
					.setColor('#00ff00')
					.setTitle('Server added')
					.setDescription(`Server ${serverHostname}:${serverGamePort} with ID: [${new_server.id}] added to the database.`)
					.setTimestamp()
				return await interaction.reply({ embeds: [embed] });
			}
		} catch (error) {
			console.log(error);
			// if server was not created, return error
			const embed = new MessageEmbed()
				.setColor('#ff0000')
				.setTitle('Server not added')
				.setDescription(`Server ${serverHostname}:${serverGamePort} was not added to the database.`)
				.addFields(
					{ name: 'Error', value: error as any },
				)
				.setTimestamp()
			return await interaction.reply({ embeds: [embed] });
		}
	}
}
