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
import { UserModel } from "../models/UserModel";
import type { MiscordUserSchema } from "../models/UserModel";


export default class UsersController {

    private model: typeof UserModel;

    constructor() {
        this.model = UserModel;
    }
    
    public async findByUserId(UserId: string) {
        const User = await this.model.findOne({ UserId });
        return User;
    }

    public async findOne(query: any) {
        const User = await this.model.findOne(query);
        return User;
    }

    public async findMany(query: any) {
        const User = await this.model.find(query);
        return User;
    }

    public create(newUser: MiscordUserSchema) {
        return new Promise((resolve, reject) => {
            this.model.create(newUser, (err, User) => {
                if (err) reject(err);
                resolve(User);
            });
        });
    }
}