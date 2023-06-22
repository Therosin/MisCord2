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

import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction, Message, Snowflake } from 'discord.js';

export class UserPrecondition extends AllFlowsPrecondition {
    #message = 'UNAUTHORISED:: Can only be used by the Guild Owner.';

    private async doGuildOwnerCheck(guildId: Snowflake, userId: Snowflake) {
        let guild = await this.container.database.Guilds.findGuild(guildId);
        if (guild) {
            return guild.OwnerID === userId ? this.ok() : this.error({ message: this.#message });
        } else {
            return this.error({ message: this.#message });
        }
    }

    public override chatInputRun(interaction: CommandInteraction) {
        const { guildId, user } = interaction;
        return this.doGuildOwnerCheck(guildId as Snowflake, user.id);
    }

    public override contextMenuRun(interaction: ContextMenuInteraction) {
        const { guildId, user } = interaction;
        return this.doGuildOwnerCheck(guildId as Snowflake, user.id);
    }

    public override messageRun(message: Message) {
        const { guildId, author } = message;
        return this.doGuildOwnerCheck(guildId as Snowflake, author.id);
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        OwnerOnly: never;
    }
}
