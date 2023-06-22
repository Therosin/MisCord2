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
import { container } from "@sapphire/framework";
import type { Snowflake } from "discord.js";
import type { MiscordServer } from "./models/ServerModel";


export async function CreateServerForGuild(guildId: Snowflake, server: MiscordServer) {
    const { Guilds, Servers } = container.database;

    const guild = await Guilds.findGuild(guildId);
    if (!guild) {
        throw new Error("Guild not found");
    }
    const newServer = await Servers.addServer(server);
    if (!newServer || !newServer.id) {
        throw new Error("Failed to create server");
    }
    const serverAdded = await Guilds.addServer(guildId, newServer.id);
    if (!serverAdded) {
        throw new Error("Failed to add server to guild");
    }
    return newServer;
}


export async function GetServersForGuild(guildId: string): Promise<MiscordServer[] | null> {
    const { Guilds, Servers } = container.database;
    const guildServers = await Guilds.getGuildServers(guildId);
    if (!guildServers) return null;
    const servers = await Servers.getServersByServerIds(guildServers);
    return servers || null;
}

export async function GetServerById(serverId: string): Promise<MiscordServer | null> {
    const { Servers } = container.database;
    const server = await Servers.getServerByServerId(serverId);
    return server || null;
}


export async function findServerByGuildAndId(guildId: string, Id: string): Promise<MiscordServer | null> {
    const guild_servers = await GetServersForGuild(guildId);
    if (!guild_servers) {
        return null;
    }

    const server = guild_servers.find(s => s.id?.slice(-5) === Id);
    return server || null;
}
