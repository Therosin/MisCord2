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

import { SapphireClient, container } from '@sapphire/framework';
import MiscordDatabase from '../database/MiscordDatabase';
import { LogLevel } from '@sapphire/framework';
import { envParseNumber, envParseString } from '../lib/env-parser';

export const dbConnect = async () => {
    const dbUri = envParseString('MONGO_URI');
    const dbKind = envParseString('MONGO_KIND');
    const dbUser = envParseString('MONGO_USER');
    const dbPass = envParseString('MONGO_PASS');
    const dbName = envParseString('MONGO_DB');
    const connectionString = `${dbKind}://${dbUser}:${dbPass}@${dbUri}/${dbName}?retryWrites=true&w=majority`;
    container.database = new MiscordDatabase();
    return await container.database.Connect(connectionString);
}

export const dbDisconnect = async () => {
    return await container.database.Disconnect();
}


export class MiscordClient extends SapphireClient {
    public constructor() {
        super({
            defaultPrefix: envParseString('DISCORD_PREFIX', '#m'),
            caseInsensitiveCommands: true,
            logger: {
                level: LogLevel.Debug
            },
            shards: 'auto',
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_BANS',
                'GUILD_EMOJIS_AND_STICKERS',
                'GUILD_VOICE_STATES',
                'GUILD_MESSAGES',
                'GUILD_MESSAGE_REACTIONS',
                'DIRECT_MESSAGES',
                'DIRECT_MESSAGE_REACTIONS'
            ],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
            loadMessageCommandListeners: true,
            api: {
                // Webservice
                auth: {
                    id: envParseString('DISCORD_CLIENT_ID'),
                    secret: envParseString('DISCORD_CLIENT_SECRET'),
                    cookie: envParseString('AUTH_COOKIE_NAME', 'MISCORD_AUTH'),
                    redirect: envParseString('DISCORD_REDIRECT_URI'),
                    scopes: ['identify', 'email', 'guilds'],
                    transformers: []
                },
                // The prefix for all routes, e.g. / or v1/
                prefix: envParseString('WEBSERVICE_PREFIX', 'v1/'),
                // The origin header to be set on every request at 'Access-Control-Allow-Origin.
                origin: envParseString('WEBSERVICE_ORIGIN', '*'),
                // Any options passed to the NodeJS "net" internal server.listen function
                // See https://nodejs.org/api/net.html#net_server_listen_options_callback
                listenOptions: {
                    // The host to listen on
                    host: envParseString('WEBSERVICE_HOST', 'localhost'),
                    // The port the API will listen on
                    port: envParseNumber('WEBSERVICE_PORT', 3001)
                }
            }
        });
    }

    public override async login(token: string) {
        try {
            await dbConnect();
            container.logger.info('MisCord is now connected to the database.');
        } catch (err) {
            throw new Error(`MisCord Database Connection Error: ${err}`);
        }
        return super.login(token);
    }

    public async destroy() {
        try {
            await dbDisconnect();
            container.logger.info('MisCord is now disconnected from the database.');
        } catch (err) {
            throw new Error(`MisCord Database Disconnection Error: ${err}`);
        }
    }

}


declare module '@sapphire/pieces' {
    interface Container {
        database: MiscordDatabase;
    }
}
