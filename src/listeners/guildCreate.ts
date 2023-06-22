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

import type { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import type { MiscordGuild } from '../database/models/GuildModel';

export class GuildCreateEvent extends Listener<typeof Events.GuildCreate> {

    public async run(guild: Guild) {
        this.container.logger.debug(`GuildCreateEvent: ${guild.name} (${guild.id})`);

        //const channels = await fetchGuildChannels(guild);
        //const roles = await fetchGuildRoles(guild);

        const newGuild: MiscordGuild = {
            GuildID: guild.id,
            OwnerID: guild.ownerId,
            Name: guild.name,
            Description: guild.description ?? '',
            Icon: guild.iconURL() ?? '',
            Settings: {
                Prefix: this.container.client.options.defaultPrefix as string,
                Language: guild.preferredLocale,
            }
        };

        const { Guilds } = this.container.database;
        const existingGuild = await Guilds.findGuild(guild.id);
        if (existingGuild) {
            this.container.logger.debug(`GuildCreateEvent: ${guild.name} (${guild.id}) already exists, updating`);
            await Guilds.updateGuild(guild.id, newGuild);
            return;
        }
        const guildData = await Guilds.createGuild(guild.id, newGuild);
        this.container.logger.debug(`Guild Data: ${guild.name} (${guild.id}) - ${guildData}`);
        this.container.logger.info(`Joined guild: ${guild.name} (${guild.id})`);
    }
}
