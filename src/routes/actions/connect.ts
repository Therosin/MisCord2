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

import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';

import { getDirectConnectString } from '../../lib/Miscreated';
import { GetServerById } from '../../database/DatabaseUtils';
import { renderFile, respondHtml } from '../../lib/api-utils';

@ApplyOptions<Route.Options>({
    /**
     * @api {get} /api/actions/connect Direct Connect to a server
    */
    route: 'action/connect',
})
export default class DirectConnectRoute extends Route {

    public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
        const { serverId } = _request.query;

        const server = await GetServerById(serverId.toString());
        if (!server) {
            response.status(403).json({ message: `Server ${serverId.toString()} not found` });
            return;
        }

        const directConnectString = getDirectConnectString(server.Host, server.GamePort);

        const context = {
            serverName: server.Name,
            serverId: server.id,
            serverHost: server.Host,
            serverPort: server.GamePort,
            connectionString: directConnectString,
        }
        const page = await renderFile("actions/ServerConnect", context);
        return respondHtml(response, page);
    }

}
