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
import { MiscordServer, ServerModel } from "../models/ServerModel";
import type { MiscordServerSchema } from "../models/ServerModel";
import { encryptString, decryptString, randomString } from "../../lib/utils";
import { envParseString } from "../../lib/env-parser";
import type { MiscreatedServer } from "../../structures/MiscreatedServer";
const MONGO_SECRET = envParseString("MONGO_SECRET", "q92c8meq92c");




function cleanServer(server: any) {
    if (!server) return null;
    delete server._id;
    delete server.__v;
    delete server.RconPassword;
    delete server.ServerToken;
    return server;
}



export default class ServersController {

    private model: typeof ServerModel;

    constructor() {
        this.model = ServerModel;
    }

    // ─── Internal ────────────────────────────────────────────────────────────────

    // Create Server
    private async create(serverInfo: MiscreatedServer) {
        if (!serverInfo) throw new Error("No server info provided");
        if (!serverInfo.Name || typeof serverInfo.Name !== "string") throw new Error("Invalid server name");
        if (!serverInfo.Host || typeof serverInfo.Host !== "string") throw new Error("Invalid server host");
        if (!serverInfo.GamePort || typeof serverInfo.GamePort !== "number") throw new Error("Invalid server game port");
        if (!serverInfo.RconPort || typeof serverInfo.RconPort !== "number") throw new Error("Invalid server rcon port");

        const existingServer = await this.model.findOne({ Host: serverInfo.Host, GamePort: serverInfo.GamePort });
        if (existingServer) throw new Error("Server already exists");

        const newServer = {
            Name: serverInfo.Name,
            Description: serverInfo.Description,
            Host: serverInfo.Host,
            GamePort: serverInfo.GamePort,
            RconPort: serverInfo.RconPort,
            GameType: serverInfo.GameType,
            RconPassword: undefined,
            ServerToken: undefined,
        } as MiscordServerSchema;
        if (serverInfo.RconPassword) newServer.RconPassword = encryptString(serverInfo.RconPassword, MONGO_SECRET);
        if (serverInfo.ServerToken) newServer.ServerToken = encryptString(serverInfo.ServerToken, MONGO_SECRET);

        const server = await this.model.create(newServer);
        if (!server) throw new Error("Failed to create server");
        return server;
    }

    /**
     * internal: Update a server in the database.
     * @param id The id of the server to update.
     * @param serverData The server to update.
     * @returns The updated server.
     * @private
    */
    private async update(id: any, serverData: MiscordServerSchema) {
        const updatedserver = await this.model.findByIdAndUpdate(id, serverData, { new: false });
        return updatedserver;
    }

    /**
     * internal: Delete a server in the database.
     * @param id The id of the server to delete.
     * @returns The deleted server.
     * @private
    */
    private async delete(id: any) {
        const server = await this.model.findByIdAndDelete(id);
        return server;
    }

    /**
     * internal: find a server by server id
     * @param serverId The serverId of the server to find.
     * @returns The found server.
     * @private
    */
    private async findById(serverId: string) {
        const server = await this.model.findOne({ serverID: serverId });
        return server
    }

    /**
     * find a server using the specified query object
     * @param query The query to use, can be any valid mongoose query.
     * @returns The found server.
     * @private
     * @example
     * /// find a servers by ownerId
     * const servers = await serversController.find({ OwnerID: '1234567890' });
    */
    private async findMany(query: any) {
        const servers = await this.model.find(query);
        return servers;
    }



    // ─── Public ─────────────────────────────────────────────────────────────────
    // these all return an object of type MiscordServer

    /**
     * Get a Server by ServerId.
     * @param serverId The serverId of the server to get.
     * @returns The found server.
     * @throws Error if the serverId is invalid.
     * @throws Error if the server could not be found.
     */
    public async getServerByServerId(serverId: string) {
        if (!serverId) throw new Error("Invalid serverId");
        const server = await this.findById(serverId);
        if (!server) throw new Error("Server not found");
        const result = server.toObject() as any;
        cleanServer(result);
        return result as MiscordServer;
    }

    /**
     * Add a Server.
     * @param serverInfo The server info to add.
     * @returns The added server.
     * @throws Error if the server info is invalid.
     * @throws Error if the server already exists.
     * @throws Error if the server could not be added.
    */
    public async addServer(serverInfo: MiscreatedServer) {
        if (!serverInfo) throw new Error("No server info provided");
        serverInfo.ServerToken = randomString("##################");
        const createdServer = await this.create(serverInfo);
        const result = createdServer.toObject() as any;
        cleanServer(result);
        return result as MiscordServer;
    }

    /**
     * Update a Server.
     * @param serverId The id of the server to update.
     * @param serverData The server data to update.
     * @returns The updated server.
     * @throws Error if the server id is invalid.
     * @throws Error if the server data is invalid.
     */
    public async updateServer(serverId: string, serverData: MiscordServerSchema) {
        if (!serverId) throw new Error("Invalid server id");
        if (!serverData) throw new Error("Invalid server data");
        const updatedServer = await this.update(serverId, serverData);
        if (!updatedServer) throw new Error("Failed to update server");
        const result = updatedServer.toObject() as any;
        cleanServer(result);
        return result as MiscordServer;
    }

    /**
     * Delete a Server.
     * @param serverId The id of the server to delete.
     * @returns The deleted server.
     * @throws Error if the server id is invalid.
    */
    public async deleteServer(serverId: string) {
        if (!serverId) throw new Error("Invalid server id");
        const deletedServer = await this.delete(serverId);
        if (!deletedServer) throw new Error("Failed to delete server");
        const result = deletedServer.toObject() as any;
        cleanServer(result);
        return result as MiscordServer
    }

    /**
     * Get a Server by Host and GamePort.
     * @param host The host of the server to get.
     * @param gamePort The game port of the server to get.
     * @returns The found server.
     * @throws Error if the host is invalid.
     * @throws Error if the game port is invalid.
     * @throws Error if the server could not be found.
    */
    public async getServerByHostAndGamePort(host: string, gamePort: number) {
        if (!host) throw new Error("Invalid host");
        if (!gamePort) throw new Error("Invalid game port");
        const server = await this.model.findOne({ Host: host, GamePort: gamePort });
        if (!server) throw new Error("Server not found");
        const result = server.toObject() as any;
        cleanServer(result);
        return result as MiscordServer;
    }

    /**
     * Find servers by ownerId.
     * @param ownerId The ownerId of the servers to find.
     * @returns The found servers.
     * @throws Error if the ownerId is invalid.
     * @throws Error if the servers could not be found.
    */
    public async getServersByOwnerId(ownerId: string) {
        if (!ownerId) throw new Error("Invalid ownerId");
        const servers = await this.findMany({ OwnerID: ownerId });
        if (!servers) throw new Error("Servers not found");
        return servers.map((server) => {
            const result = server.toObject() as any;
            cleanServer(result);
            return result as MiscordServer;
        });
    }

    /**
     * Get all servers, optionally filtered by a query.
     * @param query The query to use, can be any valid mongoose query.
     * @returns The found servers.
     * @throws Error if the servers could not be found.
    */
    public async getAllServers(query?: any) {
        const servers = await this.findMany(query);
        if (!servers) throw new Error("Servers not found");
        return servers.map((server) => {
            const result = server.toObject() as any;
            cleanServer(result);
            return result as MiscordServer;
        });
    }

    /**
     * Get a list of servers by serverId. (hex)
     * @param serverIds The serverIds of the servers to get.
     * @returns The found servers.
     * @throws Error if the serverIds are invalid.
     * @throws Error if the servers could not be found.
    */
    public async getServersByServerIds(serverIds: string[]) {
        if (!serverIds) throw new Error("Invalid serverIds");
        const servers = await this.findMany({ id: { $in: serverIds } });
        if (!servers) throw new Error("Servers not found");
        return servers.map((server) => {
            const result = server.toObject() as any;
            cleanServer(result);
            return result as MiscordServer;
        });
    }

    /**
     * Update a servers RconPassword.
     * @param serverId The id of the server to update.
     * @param rconPassword The new rcon password.
     * @returns The updated server.
     * @throws Error if the server id is invalid.
     * @throws Error if the rcon password is invalid.
     * @throws Error if the server could not be found.
    */
    public async updateRconPassword(serverId: string, rconPassword: string) {
        if (!serverId) throw new Error("Invalid server id");
        if (!rconPassword) throw new Error("Invalid rcon password");
        const server = await this.findById(serverId);
        if (!server) throw new Error("Server not found");
        server.RconPassword = rconPassword;
        const updatedServer = await server.save();
        const result = updatedServer.toObject() as any;
        cleanServer(result);
        return result as MiscordServer;
    }

    /**
     * Get a servers RconPassword.
     * @param serverId The id of the server to get.
     * @returns The servers rcon password.
     * @throws Error if the server id is invalid.
     * @throws Error if the server could not be found.
     * @throws Error if the server does not have an rcon password.
    */
    public async getRconPassword(serverId: string) {
        if (!serverId) throw new Error("Invalid server id");
        const server = await this.findById(serverId);
        if (!server) throw new Error("Server not found");
        if (!server.RconPassword) throw new Error("Server does not have an rcon password");
        const encryptedRconPassword = server.RconPassword;
        const decryptedRconPassword = decryptString(encryptedRconPassword, MONGO_SECRET);
        return decryptedRconPassword;
    }

    /**
     * Update a servers ServerToken.
     * @param serverId The id of the server to update.
     * @param serverToken The new server token.
     * @returns The updated server.
     * @throws Error if the server id is invalid.
     * @throws Error if the server token is invalid.
     * @throws Error if the server could not be found.
    */
    public async updateServerToken(serverId: string, serverToken: string) {
        if (!serverId) throw new Error("Invalid server id");
        if (!serverToken) throw new Error("Invalid server token");
        const server = await this.findById(serverId);
        if (!server) throw new Error("Server not found");
        server.ServerToken = serverToken;
        const updatedServer = await server.save();
        const result = updatedServer.toObject() as any;
        cleanServer(result);
        return result as MiscordServer;
    }

    /**
     * get a servers ServerToken.
     * @param serverId The id of the server to get.
     * @returns The server token.
     * @throws Error if the server id is invalid.
     * @throws Error if the server could not be found.
     * @throws Error if the server does not have a server token.
    */
    public async getServerToken(serverId: string) {
        if (!serverId) throw new Error("Invalid server id");
        const server = await this.findById(serverId);
        if (!server) throw new Error("Server not found");
        if (!server.ServerToken) throw new Error("Server token not found");
        const encryptedToken = server.ServerToken;
        const decryptedToken = decryptString(encryptedToken, MONGO_SECRET);
        return decryptedToken;
    }


    /**
     * Update a server state.
     * @param serverId The id of the server to update.
     * @param state The new state.
     * @returns The updated server.
     * @throws Error if the server id is invalid.
     * @throws Error if the state is invalid.
     */
    public async updateServerState(serverId: string, state: MiscordServerSchema["ServerState"]) {
        if (!serverId) throw new Error("Invalid server id");
        if (!state) throw new Error("Invalid state");
        const server = await this.findById(serverId);
        if (!server) throw new Error("Server not found");
        server.ServerState = state;
        const updatedServer = await server.save();
        const result = updatedServer.toObject() as any;
        cleanServer(result);
        return result as MiscordServer;
    }

    /**
     * Get a server state.
     * @param serverId The id of the server to get.
     * @returns The server state.
     * @throws Error if the server id is invalid.
     * @throws Error if the server could not be found.
     */
    public async getServerState(serverId: string) {
        if (!serverId) throw new Error("Invalid server id");
        const server = await this.findById(serverId);
        if (!server) throw new Error("Server not found");
        return server.ServerState;
    }
}
