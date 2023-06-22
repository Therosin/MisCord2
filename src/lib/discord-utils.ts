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

import { Command, container } from "@sapphire/framework";
import {
    Message, MessageEmbed,
    Modal, ModalActionRowComponent, TextInputComponent,
    MessageActionRow, ColorResolvable, MessageButton, Guild, MessageButtonStyleResolvable,
} from "discord.js";





export async function fetchGuildRoles(guild: Guild) {
    const roles = await guild.roles.fetch();
    // create a map of roles
    const roleMap = new Map<string, string>();
    roles.each((role) => {
        roleMap.set(role.id, role.name);
    });
    return roleMap;
}

export async function fetchGuildChannels(guild: Guild) {
    const channels = await guild.channels.fetch();
    // create a map of channels
    const channelMap = new Map<string, string>();
    channels.each((channel) => {
        if (channel?.isText()) {
            channelMap.set(channel.id, channel.name);
        }
    });
    return channelMap;
}


export function fetchEmote(emoteName: string) {
    return new Promise<string>((resolve, reject) => {
        const emote = container.client.emojis.cache.find(e => e.name === emoteName);
        if (emote) {
            resolve(emote.toString());
        } else {
            reject(`Emote ${emoteName} not found.`);
        }
    });
}


export interface CommandModelInput {
    /** The name of the input */
    name: string;
    /** The Label (45 char max) */
    label: string;
    /** The Placeholder */
    placeholder: string;
    /** Is this field required? */
    required?: boolean;
    /** Input Style */
    style?: "SHORT" | "PARAGRAPH";
    /** Min Length */
    minLength?: number;
    /** Max Length */
    maxLength?: number;
}

export interface CommandModelSchema {
    fields: CommandModelInput[];
}

export function CreateModel(guildId: string, command: string, title: string, schema: CommandModelSchema) {
    const modal = new Modal()
        .setTitle(title)
        .setCustomId(`${command.toLowerCase()}--${guildId}`);

    let idx = 0;
    for (const field of schema.fields) {
        if (idx <= 5) {
            const NewTextComponent = new TextInputComponent()
                .setCustomId(`${field.name.toLowerCase().replaceAll(" ", "-")}`)
                .setLabel(field.label)
                .setPlaceholder(field.placeholder)
                .setRequired(field.required ?? false)
                .setStyle(field.style ?? "SHORT")
                .setMinLength(field.minLength ?? 1)
                .setMaxLength(field.maxLength ?? 75)

            const NewRow = new MessageActionRow<ModalActionRowComponent>()
                .addComponents(NewTextComponent);

            modal.addComponents(NewRow);
        }
    }
    return modal;
}


export interface PagedEmbedSchema {
    /** The title of the embed */
    title: string;
    /** The description of the embed */
    description: string;
    /** The color of the embed */
    color?: ColorResolvable;
    /** Limit of items per page */
    limit?: number;
    /** The thumbnail of the embed */
    thumbnail?: string;
}

export interface PagedEmbedItem {
    /** The name of the item */
    name: string;
    /** The value of the item */
    value: string;
    /** The color of the item */
    color?: ColorResolvable;
    /** The thumbnail of the item */
    thumbnail?: string | undefined;
}

/**
 * Creates a pagination embed
 * @param {Interaction} interaction
 * @param {MessageEmbed[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 * @returns
 */
export async function paginationEmbed(interaction: Command.ChatInputInteraction, pages: MessageEmbed[], buttonList: MessageButton[], timeout: number = 120000, empheral = false) {
    if (!pages) throw new Error("No Pages");
    if (!buttonList) throw new Error("No Buttons");
    if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
        throw new Error(
            "Link buttons are not supported"
        );
    if (buttonList.length > 5) throw new Error("Too many buttons");

    let page = 0;

    const row = new MessageActionRow().addComponents(buttonList);
    if (interaction.deferred == false) {
        await interaction.deferReply({
            ephemeral: empheral,
            fetchReply: true
        });
    }

    const curPage = await interaction.editReply({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        components: [row],
        empheral: empheral
    } as any);

    const filter = (i: any) =>
        i.customId === buttonList[0].customId ||
        i.customId === buttonList[1].customId;

    // @ts-ignore
    const collector = await curPage.createMessageComponentCollector({
        filter,
        time: timeout,
    });

    collector.on("collect", async (i: any) => {
        switch (i.customId) {
            case buttonList[0].customId:
                page = page > 0 ? --page : pages.length - 1;
                break;
            case buttonList[1].customId:
                page = page + 1 < pages.length ? ++page : 0;
                break;
            default:
                break;
        }
        await i.deferUpdate();
        await i.editReply({
            embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
            components: [row],
            empheral: empheral
        });
        collector.resetTimer();
    });

    collector.on("end", (_: any, reason: any) => {
        if (reason !== "messageDelete") {
            const disabledRow = new MessageActionRow().addComponents(
                buttonList[0].setDisabled(true),
                buttonList[1].setDisabled(true)
            );
            interaction.editReply({
                embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
                components: [disabledRow],
            });
        }
    });

    return { interaction, curPage };
};


/**
 * Pageinate a list of embeds
 * @param interaction The interaction to send the embed to
 * @param items {MessageEmbed[]} The list of embeds to pageinate
 * @param timeout {number} The timeout for the embed
 * @param empheral {boolean} Should the embed be empheral?
 * @example
 * ```ts
 * const embeds = [
 *    new MessageEmbed().setTitle("Page 1"),
 *    new MessageEmbed().setTitle("Page 2"),
 *    new MessageEmbed().setTitle("Page 3"),
 * ];
 * 
 * await ShowPagedEmbed(interaction, embeds);
 */
export async function ShowPagedEmbed(interaction: Command.ChatInputInteraction | Message, items: MessageEmbed[], timeout: number, empheral = false) {

    // previous button
    const previousButton = new MessageButton()
        .setCustomId('page-previous')
        .setLabel('⏪ Previous')
        .setStyle('PRIMARY');

    // next button
    const nextButton = new MessageButton()
        .setCustomId('page-next')
        .setLabel('⏩ Next')
        .setStyle('PRIMARY');

    const messageButtons = [previousButton, nextButton];

    return paginationEmbed(interaction as any, items, messageButtons as any, timeout, empheral);
}

export function CreateMessageButton(label: string, style: MessageButtonStyleResolvable, customId: string, disabled = false) {
    return new MessageButton()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(style)
        .setDisabled(disabled);
}
