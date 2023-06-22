import type { ChatInputCommandSuccessPayload, Command, ContextMenuCommandSuccessPayload, MessageCommandSuccessPayload } from '@sapphire/framework';
import { container } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { cyan } from 'colorette';
import type { APIUser } from 'discord-api-types/v9';
import { Guild, Message, MessageEmbed, User } from 'discord.js';
import { RandomLoadingMessage } from './constants';

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, } from 'crypto';

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
    const { length } = array;
    return array[Math.floor(Math.random() * length)];
}

/**
 * Sends a loading message to the current channel
 * @param message The message data for which to send the loading message
 */
export function sendLoadingMessage(message: Message): Promise<typeof message> {
    return send(message, { embeds: [new MessageEmbed().setDescription(pickRandom(RandomLoadingMessage)).setColor('#FF0000')] });
}

export function logSuccessCommand(payload: ContextMenuCommandSuccessPayload | ChatInputCommandSuccessPayload | MessageCommandSuccessPayload): void {
    let successLoggerData: ReturnType<typeof getSuccessLoggerData>;

    if ('interaction' in payload) {
        successLoggerData = getSuccessLoggerData(payload.interaction.guild, payload.interaction.user, payload.command);
    } else {
        successLoggerData = getSuccessLoggerData(payload.message.guild, payload.message.author, payload.command);
    }

    container.logger.debug(`${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`);
}

export function getSuccessLoggerData(guild: Guild | null, user: User, command: Command) {
    const shard = getShardInfo(guild?.shardId ?? 0);
    const commandName = cyan(getCommandInfo(command).name);
    const author = getAuthorInfo(user);
    const sentAt = getGuildInfo(guild);

    return { shard, commandName, author, sentAt };
}

function getShardInfo(id: number) {
    return `[${cyan(id.toString())}]`;
}

export function getCommandInfo(command: Command) {
    return {
        name: `${command.name}`,
        description: `${command.description}`,
        category: `${command.category}`,
        aliases: `${command.aliases}`,
        parentCatagory: `${command.parentCategory}`,
        detailedDescription: `${command.detailedDescription}`,
    }
}

export function getAuthorInfo(author: User | APIUser) {
    return `${author.username}[${cyan(author.id)}]`;
}

export function getGuildInfo(guild: Guild | null) {
    if (guild === null) return 'Direct Messages';
    return `${guild.name}[${cyan(guild.id)}]`;
}

export const randomNum = (min: number, max: number) => {
    return Math.floor((Math.random() * max) + min);
}


/**
 * Creates a random string based on the given pattern
 * @param pattern The pattern to use for the random string
 * 9 = Number
 * a = Lowercase Letter
 * A = Uppercase Letter
 * * = Any Character in the above list
 * # = Any Hexadecimal Character
 * any other character will be used as is
*/
export function randomString(pattern: string) {
    let result = '';
    const patternLength = pattern.length;
    for (let i = 0; i < patternLength; i++) {
        switch (pattern.charAt(i)) {
            case '9':
                // 0-9
                result += Math.floor(Math.random() * 10);
                break;
            case 'a':
                // a-z
                result += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
                break;
            case 'A':
                // A-Z
                result += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
                break;
            case '*':
                // a-zA-Z0-9
                result += String.fromCharCode(Math.floor(Math.random() * 62) + 48);
                break;
            case '#':
                // 0-9a-fA-F
                result += Math.floor(Math.random() * 16).toString(16).toUpperCase();
                break;
            default:
                result += pattern.charAt(i);
                break;
        }
    }
    return result;
}


/** Generate UUID v4 */
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/** Expands variables in a string
 * @param str The string to expand
 * @param variables The variables to expand
 * @example
 * const str = 'Hello #{name}!';
 * const variables = { name: 'World' };
 * const expanded = expandVariables(str, variables); // 'Hello World!'
*/
export function expandString(str: string, data: Record<string, string>) {
    for (const key in data) {
        str = str.toString().replace(new RegExp(`#{${key}}`, 'g'), data[key]);
    }
    return str;
}

/**
 * Encrypts a string using given password
 * @param data The data to encrypt
 * @param password The secret to use for encryption
 * @returns The encrypted string
 */
export function encryptString(data: string, password: string) {
    const hashedPassword = createHash('sha256').update(password).digest('base64').substr(0, 32);
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', hashedPassword, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string using given password
 * @param data The data to decrypt
 * @param password The secret to use for decryption
 * @returns The decrypted string
 * @throws {Error} If the data is not in the correct format
 * @throws {Error} If the password is incorrect
 */
export function decryptString(data: string, password: string) {
    const hashedPassword = createHash('sha256').update(password).digest('base64').substr(0, 32);
    const [iv, encrypted] = data.split(':');
    const decipher = createDecipheriv('aes-256-cbc', hashedPassword, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);
    return decrypted.toString();
}

export function createHmac265(data: string, key: string): string {
    return createHmac('sha256', key).update(data).digest('hex');
}

export function base64_urlencode(data: string): string {
    return Buffer.from(data).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64_urldecode(data: string): string {
    return Buffer.from(data, 'base64').toString('ascii');
}


// convert a time string like 1h5m to milliseconds
export const timeStringToMilliseconds = (time: string) => {
    const timeRegex = /(\d+)([a-z])/g;
    const timeParts = time.match(timeRegex);
    if (!timeParts) {
        return 0;
    }
    let timeInMilliseconds = 0;
    for (const timePart of timeParts) {
        const timePartRegex = /(\d+)([a-z])/g;
        const timePartMatch = timePartRegex.exec(timePart);
        if (!timePartMatch) {
            continue;
        }
        const [, timePartValue, timePartUnit] = timePartMatch;
        const timePartValueNumber = parseInt(timePartValue, 10);
        switch (timePartUnit) {
            case 's':
                timeInMilliseconds += timePartValueNumber * 1000;
                break;
            case 'm':
                timeInMilliseconds += timePartValueNumber * 1000 * 60;
                break;
            case 'h':
                timeInMilliseconds += timePartValueNumber * 1000 * 60 * 60;
                break;
            case 'd':
                timeInMilliseconds += timePartValueNumber * 1000 * 60 * 60 * 24;
                break;
            default:
                break;
        }
    }
    return timeInMilliseconds;
};
