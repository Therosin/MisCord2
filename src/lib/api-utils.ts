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

//import type { ApiRequest, ApiResponse } from "@sapphire/plugin-api";
import { container } from "@sapphire/framework";
import type { ApiResponse } from "@sapphire/plugin-api";



import { Liquid } from 'liquidjs';

import path from 'path';

var engine = new Liquid({
    root: path.join(__dirname, '../views'),
    extname: ".html"
});


export async function renderFile(path: string, context: { [x: string]: any; }) {
    const html = await engine.renderFile(path, context)
    return html;
}

export function respondHtml(response: ApiResponse, html: string) {
    response.status(200)
    response.setHeader('Content-Type', 'text/html')
    response.write(html);
    return response.end();
}






/**
 * Try to get fetch a User using OAuth2
 * @param token The OAuth2 token for the user
 * @returns The user object or null if not found
 */
export async function fetchOauthUser(token: string) {
    const user = await container.server.auth?.fetchData(token);
    return user || null;
}


/**
 * Try to get fetch a User using Discord Client
 * @param userId The discord ID of the user
 * @returns The user object or null if not found
*/
export async function fetchDiscordUser(userId: string) {
    const user = await container.client.users.fetch(userId);
    return user || null;
}


/**
 * Check if a user is in the specified guild
 * @param token The OAuth2 token for the user
 * @param guilds list of guilds to check if the user is in
 * @returns True if the user is in any of the guilds
 */
export async function ReguireGuildMembership(token: string, guilds: string[]) {
    const user = await fetchOauthUser(token);
    if (!user) return false;
    const userGuilds = user.guilds?.map(g => g.id);
    if (!userGuilds) return false;
    const hasGuild = guilds.some(g => userGuilds.includes(g));
    return hasGuild;
}


/**
 * Check if a user is in the specified guild and has the specified role
 * @param token The OAuth2 token for the user
 * @param guildId The discord ID of the guild
 * @param roles list of roles to check if the user has
 * @returns True if the user is in any of the roles
 */
export async function ReguireGuildRole(token: string, guildId: string, roles: string[]) {
    const user = await fetchOauthUser(token);
    const userId = user?.user?.id;
    if (!user || !userId) return false;
    const guild = container.client.guilds.cache.get(guildId);
    if (!guild) return false;
    const member = await guild.members.fetch(userId);
    if (!member) return false;
    const memberRoles = member.roles.cache.map(r => r.id);
    const hasRole = roles.some(r => memberRoles.includes(r));
    return hasRole;
}
