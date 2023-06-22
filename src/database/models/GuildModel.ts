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

import type { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';
import type { ObjectId } from 'bson';
import { envParseString } from '../../lib/env-parser';
const DEFAULT_PREFIX = envParseString('DISCORD_PREFIX', '#m');

/** Miscord Guild Settings */
export interface MiscordGuildSettings {
    /** Guild Prefix */
    Prefix?: string;
    /** Guild Language */
    Language?: string;
    /** Guild Timezone */
    Timezone?: string;
    /** Users in this Role will be able to Manage Miscord in this Guild */
    AdminRole?: Snowflake;
    /** Users in this Role will be able to use Miscord in this Guild */
    UserRole?: Snowflake;
    /** Users in this Role will not be able to use Miscord in this Guild */
    BlacklistedRole?: Snowflake;
    /** Admin Channel, this is used for Admin Messages and Commands */
    AdminChannel?: Snowflake;
    /** Logs Channel, Admins will be able to see Logs here */
    LogsChannel?: Snowflake;
}

export interface MiscordGuildSchema {
    /** ID of the server in the database */
    _id?: ObjectId;
    /** Guild Name */
    Name?: string;
    /** Guild ID */
    GuildID?: Snowflake;
    /** Guild Owner ID */
    OwnerID?: string;
    /** Guild Description */
    Description?: string;
    /** Guild Icon */
    Icon?: string;
    /** Guild Settings */
    Settings?: MiscordGuildSettings
    /** Guild Servers */
    Servers?: string[];
}

export interface MiscordGuild extends MiscordGuildSchema {
    /** Hex of database _id */
    id?: string;
    /** Guild Name */
    Name: string;
    /** Guild ID */
    GuildID: Snowflake;
    /** Guild Owner ID */
    OwnerID: string;
    /** Guild Description */
    Description: string;
    /** Guild Settings */
    Settings?: MiscordGuildSettings
}

const guildSchema = new Schema<MiscordGuildSchema>({
    GuildID: { type: String, required: true },
    Name: { type: String, required: true },
    Description: { type: String, default: '' },
    OwnerID: { type: String, required: true },
    Icon: { type: String, required: true },
    Settings: {
        Prefix: { type: String, default: DEFAULT_PREFIX },
        Language: { type: String, default: 'en' },
        Timezone: { type: String, default: 'UTC' },
        AdminRole: { type: String, default: '' },
        UserRole: { type: String, default: '' },
        BlacklistedRole: { type: String, default: '' },
        AdminChannel: { type: String, default: '' },
        LogsChannel: { type: String, default: '' }
    },
    Servers: { type: Array, default: [] }
});

guildSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

export const GuildModel = model<MiscordGuildSchema>('Guilds', guildSchema);