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

import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { Authenticated } from '../lib/api-decorators';

@ApplyOptions<Route.Options>({
    /**
     * @api {get} /api/server/:id Get server info
    */
    route: `server/:serverId`
})
export default class MainRoute extends Route {

    @Authenticated()
    public [methods.GET](_request: ApiRequest, response: ApiResponse) {
        //ReguireGuildMembership()
        const { serverId } = _request.params;
        response.json({ message: `Server ID: ${serverId}` });
    }

    @Authenticated()
    public [methods.POST](_request: ApiRequest, response: ApiResponse) {
        if (!_request.auth?.id) {
            response.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const serverId = _request.params.id;
        response.json({ message: `Server ID: ${serverId}` });
    }
}
