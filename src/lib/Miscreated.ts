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
import { NodeMisrcon } from 'node-misrcon';
import axios from 'axios';
import { LiteJWT } from './liteJWT';
import { base64_urlencode } from './utils';

const MiscreatedJWT: LiteJWT = new LiteJWT('', {
    issuer: 'MisCord2',
    audience: 'MiscreatedServer',
    subject: 'ServerInterop',
    expiration: 60,
});


const TokenManager = {
    TokenCache: new Map<string, Map<string, string>>(),
    GetToken: async (guildId: string, serverId: string, authKey: string) => {
        const guildCache = TokenManager.TokenCache.get(guildId);
        if (!guildCache) {
            TokenManager.TokenCache.set(guildId, new Map<string, string>());
        }

        const token = TokenManager.TokenCache.get(guildId)?.get(serverId);
        if (token) {
            return token;
        } else {
            const token = MiscreatedJWT.createToken({
                data: {
                    guildId: guildId,
                    authKey: authKey,
                }
            });

            TokenManager.TokenCache.get(guildId)?.set(serverId, token);
            return token;
        }
    }
}


const PromiseRetry = (func: Function, retries: number, delay: number): Promise<any> => {
    return new Promise((resolve, reject) => {
        func().then(resolve).catch((err: any) => {
            if (retries > 0) {
                setTimeout(() => {
                    PromiseRetry(func, retries - 1, delay).then(resolve).catch(reject);
                }, delay);
            } else {
                reject(err);
            }
        });
    });
}

const makeRequest = (uri: string, endpoint: string, data: any, token: string): Promise<Object> => {
    const payload = base64_urlencode(JSON.stringify(data || {}));
    return PromiseRetry(() => {
        return axios.getUri({
            url: `${uri}/ServerInterop/${endpoint}/${payload}?token=${token}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }, 3, 1000);
}

export class MiscreatedHTTPInterop {
    private GuildId: string;
    private Host: string;
    private Port: number;
    private AuthKey: string;

    constructor(guildId: string, host: string, port: number, authKey: string) {
        this.GuildId = guildId;
        this.Host = host;
        this.Port = port;
        this.AuthKey = authKey;
    }

    private async HandleRequest(endpoint: string, data?: object) {
        const token = await TokenManager.GetToken(this.GuildId, this.Host, this.AuthKey);
        const response = await makeRequest(`${this.Host}:${this.Port}`, endpoint, data, token);
        return response;
    }

    public async GetPlayerInfo(player: string) {
        return await this.HandleRequest('playerinfo', { player });
    }

    public async GetPlayerList() {
        return await this.HandleRequest('playerlist', {});
    }

    public async GetLocationInfo(kind: string) {
        return await this.HandleRequest('locationinfo', { kind });
    }

    public async GetLocationList() {
        return await this.HandleRequest('locationlist');
    }

}


class MiscreatedRCONInterop {
    private server: NodeMisrcon;

    constructor(host: string, port: number, password: string) {
        this.server = new NodeMisrcon({
            ip: host,
            port: port,
            password: password,
        });
    }

    public async sendCommand(command: string) {
        {
            await this.server.send(command);
        }
    }

    public async getStatus() {
        return await this.server.getStatus();
    }

    public async getPlayers() {
        return await this.server.getPlayers();
    }

    public async getBans() {
        return await this.server.getBanList();
    }

    public async getWhitelist() {
        return await this.server.getWhitelist();
    }

    public async getServerInfo() {
        return await this.server.getAllServerData();
    }

}

export class MiscreatedServer {
    private serverHost: string;
    private serverGamePort: number;
    private serverRconPort: number;
    private serverPassword: string | null;
    private authKey: string | null;

    constructor(host: string, gameport: number, rconport: number, password: string, authKey?: string) {
        this.serverHost = host;
        this.serverGamePort = gameport;
        this.serverRconPort = rconport;
        this.serverPassword = password || null;
        this.authKey = authKey || null;
    }

    public async getApiInterop(guildId: string) {
        if (!this.authKey) {
            throw new Error('No auth key set for this server');
        }
        return new MiscreatedHTTPInterop(guildId, this.serverHost, this.serverRconPort, this.authKey);
    }

    public async getRconInterop() {
        if (!this.serverPassword) {
            throw new Error('No password set for this server');
        }
        return new MiscreatedRCONInterop(this.serverHost, this.serverRconPort, this.serverPassword);
    }

    public getDirectConnectString() {
        return `steam://run/299740/connect/+connect%20${this.serverHost}%20${this.serverGamePort}`;
    }
}


export function getDirectConnectString(host: string, port: number) {
    return `steam://run/299740/connect/+connect%20${host}%20${port}`;
}
