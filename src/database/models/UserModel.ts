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

import { Schema, model } from 'mongoose';
import type { ObjectId } from 'bson';
//import { container } from '@sapphire/framework';

export interface MiscordUserSchema {
    /** ID of the user in the database */
    _id?: ObjectId;
    /** Discord ID of the user */
    DiscordID?: string;
    /** Discord Username of the user */
    Username?: string;
    /** Discord Discriminator of the user */
    Discriminator?: string;
    /** Discord Avatar of the user */
    AvatarURL?: string;
    /** User Settings */
    Settings?: {
        Language?: string;
    };
}

export interface MiscordUser extends MiscordUserSchema {
    /** Hex of the database _id */
    id?: string;
    /** Discord ID of the user */
    DiscordID: string;
    /** Discord Username of the user */
    Username: string;
    /** Discord Discriminator of the user */
    Discriminator: string;
}

const userSchema = new Schema<MiscordUserSchema>({
    DiscordID: { type: String, required: true },
    Username: { type: String, required: true },
    Discriminator: { type: String, required: true },
    AvatarURL: { type: String, required: true },
    Settings: {
        Language: { type: String, default: 'en' }
    }
});

userSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

export const UserModel = model<MiscordUserSchema>('Users', userSchema);