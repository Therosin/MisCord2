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

/** Represents a Miscreated Server */
export interface MiscreatedServer {
    /** Server Name */
    Name: string;
    /** Server Description */
    Description?: string;
    /** Server Host, (either IP or Hostname) */
    Host: string;
    /** Server Game Port, (commonly known as the baseport, usualy 64090) */
    GamePort: number;
    /** Server Rcon Port, (usualy GamePort +4 eg: 64094) */
    RconPort: number;
    /** Server Game Type, e.g. "PvP" or "PvE" */
    GameType?: string;
    /** Encrypted Server Rcon Password */
    RconPassword?: string;
    /** Encrypted Server Token, (used to authenticate with the MisCord API) */
    ServerToken?: string;
}