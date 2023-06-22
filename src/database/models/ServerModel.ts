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
import type { MiscreatedServer } from '../../structures/MiscreatedServer';
//import { container } from '@sapphire/framework';

export interface MiscordServerSchema extends MiscreatedServer {
    /** ID of the server in the database */
    _id?: ObjectId;
    /** Current Server State */
    ServerState?: {
        name: string;
        version: string;
        gameRules: string;
        players: number;
        level: string;
        nextRestart: string;
        time: string;
        weather: string;
        weatherPattern: string;
        upTime: string;
    }
}

export interface MiscordServer extends MiscordServerSchema {
    /** Hex of the database _id */
    id?: string;
}

const serverSchema = new Schema<MiscordServerSchema>({
    Name: { type: String, required: true },
    Description: { type: String, required: false },
    Host: { type: String, required: true },
    GamePort: { type: Number, required: true },
    RconPort: { type: Number, required: true },
    GameType: { type: String, required: false },
    RconPassword: { type: String, required: false },
    ServerToken: { type: String, required: false },
    ServerState: {
        name: { type: String, required: false },
        version: { type: String, required: false },
        gameRules: { type: String, required: false },
        players: { type: Number, required: false },
        level: { type: String, required: false },
        nextRestart: { type: String, required: false },
        time: { type: String, required: false },
        weather: { type: String, required: false },
        weatherPattern: { type: String, required: false },
        upTime: { type: String, required: false },
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

serverSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

export const ServerModel = model<MiscordServer>('Servers', serverSchema);
