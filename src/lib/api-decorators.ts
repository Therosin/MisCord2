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
import { createFunctionPrecondition } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, LoginData } from "@sapphire/plugin-api";
import { container } from "@sapphire/framework";
import { fetchOauthUser } from './api-utils';


/**
 * Must have a valid OAuth2 token
*/
export const Authenticated = (): MethodDecorator =>
    createFunctionPrecondition(
        (request: ApiRequest) => Boolean(request.auth?.token),
        (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized)
    );


/**
 * Must be a member of  one or more specified guilds
 * @param guildIds The guilds to check for membership
 * @returns {MethodDecorator}
*/
export const RequireGuildMembership = (...guildIds: string[]): MethodDecorator =>
    createFunctionPrecondition(
        async (request: ApiRequest) => {
            if (!request.auth || !request.auth.token) return false;
            const user = await fetchOauthUser(request.auth.token);
            if (!user) return false;
            const userGuilds = user.guilds?.map(g => g.id);
            if (!userGuilds) return false;
            const hasGuild = guildIds.some(g => userGuilds.includes(g));
            return hasGuild;
        },
        (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Forbidden)
    );

export const RequireGuildRole = (guildId: string, ...roleIds: string[]): MethodDecorator =>
    createFunctionPrecondition(
        async (request: ApiRequest) => {
            if (!request.auth || !request.auth.token) return false;
            const OAuth2User = await fetchOauthUser(request.auth.token);
            const { user, guilds } = OAuth2User as LoginData;
            if (!user || !guilds) return false;
            const guild = guilds.find(g => g.id === guildId);
            if (!guild) return false;
            // get guild from discord
            const discordGuild = await container.client.guilds.fetch(guildId);
            if (!discordGuild) return false;
            // get member from discord
            const member = await discordGuild.members.fetch(user.id);
            if (!member) return false;
            // get roles from discord
            const roles = member.roles.cache.map(r => r.id);
            // check if user has any of the required roles
            const hasRole = roles.some(r => roleIds.includes(r));
            return hasRole;
        },
        (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Forbidden)
    );
