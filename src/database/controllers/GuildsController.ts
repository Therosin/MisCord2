// Copyright (C) 2022 Theros < MisModding | SvalTek >
// 
// This file is part of MisCord.
// 
// MisCord is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// MisCord is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with MisCord.  If not, see <http://www.gnu.org/licenses/>.
import type { Snowflake } from "discord.js";
import { GuildModel, MiscordGuildSchema, MiscordGuild } from "../models/GuildModel";
//import type { Guild, Snowflake } from "discord.js";


export default class GuildsController {

    private model: typeof GuildModel;

    constructor() {
        this.model = GuildModel;
    }

    // ─── Internal Methods ────────────────────────────────────────────────

    /**
     * internal: Create a new Guild in the database.
     * @param guildData The guild to create.
     * @returns The created guild.
     * @private
    */
    private async create(guildData: MiscordGuildSchema) {
        const guild = await this.model.create(guildData);
        return guild;
    }

    /**
     * internal: Update a guild in the database.
     * @param id The id of the guild to update.
     * @param guildData The guild to update.
     * @returns The updated guild.
     * @private
    */
    private async update(id: any, guildData: MiscordGuildSchema) {
        const updatedGuild = await this.model.findByIdAndUpdate(id, guildData, { new: false });
        return updatedGuild;
    }

    /**
     * internal: Delete a guild in the database.
     * @param id The id of the guild to delete.
     * @returns The deleted guild.
     * @private
    */
    private async delete(id: any) {
        const guild = await this.model.findByIdAndDelete(id);
        return guild;
    }

    /**
     * internal: find a guild by discord id
     * @param guildId The guildId of the guild to find.
     * @returns The found guild.
     * @private
    */
    private async findById(guildId: Snowflake) {
        const guild = await this.model.findOne({ GuildID: guildId });
        return guild;
    }

    /**
     * find a guild using the specified query object
     * @param query The query to use, can be any valid mongoose query.
     * @returns The found guild.
     * @private
     * @example
     * /// find a guilds by ownerId
     * const guilds = await guildsController.find({ OwnerID: '1234567890' });
    */
    private async findMany(query: any) {
        const guilds = await this.model.find(query);
        return guilds;
    }

    // ─── Public Methods ─────────────────────────────────────────────────
    // these all return an object of type MiscordGuild

    /**
     * find a guild using its discord id
     * @param guildId The guildId of the guild to find.
     * @returns The found guild.
     * @public
     * @example
     * /// find a guild by its discord id
     * const guild = await guildsController.findGuild('1234567890');
    */
    public async findGuild(guildId: Snowflake) {
        const guild = await this.findById(guildId);
        if (!guild) return null;
        const result = guild.toObject() as MiscordGuild;
        return result;
    }

    /**
     * find guilds using the specified query object
     * @param query The query to use, can be any valid mongoose query.
     * @returns The found guild.
     * @public
    */
    public async findGuilds(query: any) {
        const guilds = await this.findMany(query);
        if (!guilds) return null;
        const result = guilds.map(g => g.toObject() as MiscordGuild);
        return result;
    }

    /**
     * Update a guild using its discord id
     * @param guildId The guildId of the guild to update.
     * @param guildData The guild to update.
     * @returns The updated guild.
     * @public
    */
    public async updateGuild(guildId: Snowflake, guildData: MiscordGuild) {
        const guild = await this.findById(guildId);
        if (!guild) return null;
        delete guildData.id;
        const updatedGuild = await this.update(guild._id, guildData);
        if (!updatedGuild) return null;
        const result = updatedGuild.toObject() as MiscordGuild;
        return result;
    }

    /**
     * Delete a guild using its discord id
     * @param guildId The guildId of the guild to delete.
     * @returns The deleted guild.
     * @public
    */
    public async deleteGuild(guildId: Snowflake) {
        const guild = await this.findById(guildId);
        if (!guild) return null;
        const deletedGuild = await this.delete(guild._id);
        if (!deletedGuild) return null;
        return deletedGuild.toObject() as MiscordGuild;
    }

    /**
     * Create a new guild
     * @param guildId The guildId of the guild to create.
     * @param guildData The guild to create.
     * @returns The created guild.
     * @public
    */
    public async createGuild(guildId: Snowflake, guildData: MiscordGuildSchema) {
        const guild = await this.findById(guildId);
        if (guild) throw new Error('Guild already exists');
        const newGuild = await this.create(guildData);
        if (!newGuild) return null;
        const result = newGuild.toObject() as MiscordGuild;
        return result;
    }


    /** 
     * Update guild settings
     * @param guildId The guildId of the guild to update.
     * @param settings The settings to update.
     * @returns The updated guild.
     * @public
    */
    public async updateGuildSettings(guildId: Snowflake, settings: MiscordGuild['Settings']) {
        const guild = await this.findById(guildId);
        if (!guild) return null;
        const updatedGuild = await this.update(guild._id, { Settings: settings });
        if (!updatedGuild) return null;
        const result = updatedGuild.toObject() as MiscordGuild;
        return result;
    }

    /**
     * Add Server to guild
     * @param guildId The guildId of the guild to update.
     * @param serverId The serverId of the server to add.
     * @returns The updated guild servers.
    */
    public async addServer(guildId: Snowflake, serverId: string) {
        const guild = await this.findById(guildId);
        if (!guild || !guild.Servers) return null;
        if (guild.Servers.includes(serverId)) return null;
        guild.Servers.push(serverId);
        const updatedGuild = await this.update(guild._id, guild);
        if (!updatedGuild) return null;
        const result = updatedGuild.toObject() as MiscordGuild;
        return result.Servers
    }

    /**
     * Remove Server from guild
     * @param guildId The guildId of the guild to update.
     * @param serverId The serverId of the server to remove.
     * @returns The updated guild servers.
    */
    public async removeServer(guildId: Snowflake, serverId: string) {
        const guild = await this.findById(guildId);
        if (!guild || !guild.Servers) return null;
        if (!guild.Servers.includes(serverId)) return null;
        guild.Servers = guild.Servers.filter(s => s !== serverId);
        const updatedGuild = await this.update(guild._id, guild);
        if (!updatedGuild) return null;
        const result = updatedGuild.toObject() as MiscordGuild;
        return result.Servers
    }

    /**
     * Get guild servers
     * @param guildId The guildId of the guild to get servers from.
     * @returns The guild servers.
    */
    public async getGuildServers(guildId: Snowflake) {
        const guild = await this.findById(guildId);
        if (!guild || !guild.Servers) return null;
        const result = guild.toObject() as MiscordGuild;
        return result.Servers
    }
}
