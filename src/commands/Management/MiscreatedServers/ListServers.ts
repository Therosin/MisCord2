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
import { Message, MessageEmbed } from 'discord.js';
import { ShowPagedEmbed } from '../../../lib/discord-utils';
import type { MiscordServer } from '../../../database/models/ServerModel';
//import { container } from '@sapphire/framework';

import { GetServersForGuild } from '../../../database/DatabaseUtils';


const ServerEmote = '<:server:827461152904314911>';

function formatServerInfo(serverInfo: MiscordServer) {
	return `${ServerEmote} ${serverInfo.Name} - ID: ${serverInfo.id?.toString().slice(-5)}
	> **Hostname:** ${serverInfo.Host}
	> **GamePort:** ${serverInfo.GamePort}	**RconPort**: ${serverInfo.RconPort}
	`;
}

async function genServerListPages(interaction: Command.ChatInputInteraction | Message) {
	const limit = 10;
	const servers = await GetServersForGuild(interaction.guildId as string);
	if (servers) {
		const pages: MessageEmbed[] = [];
		for (let i = 0; i < servers.length; i += limit) {
			const serverList = servers?.slice(i, i + limit).map(formatServerInfo)
			const embed = new MessageEmbed()
				.setTitle(`Servers ${i + 1}-${i + limit} of ${servers.length}`)
				.setColor('RANDOM')
				.setTimestamp()
				.setDescription(`${serverList.join('\n')}`);
			pages.push(embed);
		}

		return pages;
	}
	return [];
}


@ApplyOptions<Command.Options>({
	name: 'ListServers',
	description: 'Lists currently registered Servers'
})
export class ListMiscreatedServerCommand extends Command {
	// Register slash command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		const pages = await genServerListPages(interaction);
		if (pages.length === 0) {
			return interaction.reply({ content: 'No Servers registered.', ephemeral: true });
		}
		ShowPagedEmbed(interaction, pages, 30000, true);
	}
}
