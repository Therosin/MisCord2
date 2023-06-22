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
import { container } from '@sapphire/framework';
import { GetServersForGuild } from './database/DatabaseUtils';
import { MiscreatedServer } from './lib/Miscreated';
import { taskManager, SimpleTask } from './lib/TaskManager';
import { timeStringToMilliseconds } from './lib/utils';
import type { MiscordClient } from './structures/Miscord';

const { database } = container;

export async function RegisterTasks(miscord: MiscordClient) {
    // Update the database with the current state of the servers, every 3 minutes.
        taskManager.addTask(new SimpleTask('UpdateDBServers', async (task, context) => {
        const Servers = database.Servers;
        const guilds = miscord.guilds.cache;

        for (const guild of guilds.values()) {
            context.logger.info(`(${task.name}) :: Updating servers for guild: ${guild.name}[${guild.id}]`);
            const servers = await GetServersForGuild(guild.id);
            if (!servers || servers.length === 0) {
                continue;
            }

            for (const server of servers) {
                const password = server.RconPassword || null;
                if (password === null) {
                    continue;
                }
                const miscreatedServer = new MiscreatedServer(server.Host, server.GamePort, server.RconPort, password);
                const RCON = await miscreatedServer.getRconInterop();
                if (!RCON) {
                    continue;
                }
                const serverInfo = await RCON.getServerInfo();
                if (!serverInfo) {
                    continue;
                }
                const { status } = serverInfo;
                const { gameRules, level, name, nextRestart, playersArray, time, weather, weatherPattern, upTime, version } = status;

                const serverState = {
                    name,
                    version,
                    gameRules,
                    players: playersArray.length,
                    level,
                    nextRestart,
                    time,
                    weather,
                    weatherPattern,
                    upTime,
                };
                await Servers.updateServerState(server.id as string, serverState);
            }

            context.logger.info(`(${task.name}) :: Updated ${servers.length} servers for guild ${guild.name}[${guild.id}]`);
        }

        context.logger.info(`(${task.name}) :: Finished updating servers for ${guilds.size} guilds, next update in ${task.interval / 1000 / 60} minutes`);
    }, timeStringToMilliseconds("3m"), 3000));

    return taskManager;
}
