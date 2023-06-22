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
import { Args, Command } from "@sapphire/framework";
import { Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import type { MiscordServer } from '../../../database/models/ServerModel';
//import { container } from '@sapphire/framework';

import { findServerByGuildAndId } from '../../../database/DatabaseUtils';
import { envParseNumber, envParseString } from '../../../lib/env-parser';

const redirectUrl = ` ${envParseString('WEBSERVICE_HOST')}:${envParseNumber('WEBSERVICE_PORT')}/${envParseString('WEBSERVICE_PREFIX')}/action/connect}`;


function ServerInfoEmbed(serverInfo: MiscordServer) {

	const embed = new MessageEmbed()
		.setTitle(serverInfo.Name)
		.setColor('RANDOM')
		.setTimestamp()
		.addFields([
			{
				"name": `ServerID`,
				"value": `${serverInfo.id}`,
				"inline": false
			},
			{
				"name": `Hostname`,
				"value": `${serverInfo.Host}`,
				"inline": true
			},
			{
				"name": `GamePort`,
				"value": `${serverInfo.GamePort}`,
				"inline": true
			},
			{
				"name": `RconPort`,
				"value": `${serverInfo.RconPort}`,
				"inline": true
			}
		]);
	embed.setThumbnail('https://cdn.discordapp.com/emojis/827461152904314911.webp?size=40&quality=lossless');

	return embed;
}


@ApplyOptions<Command.Options>({
	name: 'ServerInfo',
	description: 'Shows information about a server',
	options: [
		"serverId",
	],
})
export class ListMiscreatedServerCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {

		// Register slash command
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
			options: [
				{
					name: 'server-id',
					description: 'The ID of the server',
					type: 'STRING',
					required: true,
				},
			],
		});

	}


	// chat command
	public async messageRun(message: Message, args: Args) {
		const serverId = await args.pickResult('string');
		if (!serverId.isOk) {
			return message.reply('Please provide a server ID');
		}

		return this.run(message, serverId.unwrap());
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		const serverId = interaction.options.getString('server-id', false);

		if (!serverId) {
			return interaction.reply('Please specify a server ID');
		}

		return this.run(interaction, serverId);

	}

	public async run(msg: Command.ChatInputInteraction | Message, serverId: string) {
		const server = await findServerByGuildAndId(msg.guildId!, serverId)
		if (server != null) {
			return msg.reply({
				embeds: [ServerInfoEmbed(server)],
				components: [
					new MessageActionRow().addComponents(
						new MessageButton({
							label: 'Direct Connect',
							style: 'LINK',
							url: `${redirectUrl}?serverId=${server.id}`,
						})
					)
				]
			});

		}
		return msg.reply(`Server not found with ID: ${serverId}`);
	}
}
