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
import mongoose from 'mongoose';
import GuildsController from './controllers/GuildsController';
import UsersController from './controllers/UsersController';
import ServersController from './controllers/ServersController';

export default class MiscordDatabase {
    public Guilds: GuildsController;
    public Users: UsersController;
    public Servers: ServersController;

    public constructor() {
        this.Guilds = null as any;
        this.Users = null as any;
        this.Servers = null as any;
    }

    public async Connect(connectionString: string) {
        try {
            await mongoose.connect(connectionString, {
                appName: 'MisCord',
                keepAlive: true,
                keepAliveInitialDelay: 300000,
                autoCreate: true,
                autoIndex: true,
            });
            this.Guilds = new GuildsController();
            this.Users = new UsersController();
            this.Servers = new ServersController();
            container.logger.info('Connected to MongoDB');
        } catch (error) {
            container.logger.error(error);
            throw new Error(`Failed to connect to MongoDB: ${error}`);
        }
    }

    public async Disconnect() {
        try {
            this.Guilds = null as any;
            this.Users = null as any;
            this.Servers = null as any;
            await mongoose.connection.close();
            container.logger.info('Disconnected from MongoDB');
            return true
        } catch (error) {
            container.logger.error(error);
            throw new Error(`Failed to disconnect from MongoDB: ${error}`);
        }
    }
}