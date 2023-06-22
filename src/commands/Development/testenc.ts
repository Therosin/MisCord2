import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';
import { LiteRC4 } from '../../lib/liteRC4';


@ApplyOptions<Command.Options>({
	aliases: ['enc'],
	description: 'test liteRC4',
	quotes: [],
	preconditions: ['OwnerOnly'],
	options: ['password', 'decrypt']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const plaintext = await args.rest('string');
		const password = await args.getOption('password') ?? 'password';
		const decrypt = await args.getOption('decrypt') ?? 'false';
		if (!plaintext) return send(message, 'No plaintext provided');
		let output = "";
		let result;

		switch (decrypt) {
			case 'true':
				result = await new LiteRC4(password).decrypt(plaintext, 'base64');
				output = `Decrypted: \`${result}\``;
				break;
			case 'false':
				result = await new LiteRC4(password).encrypt(plaintext, 'base64');
				output = `Encrypted: \`${result}\``;
				break;
			case undefined || null:
				return send(message, 'No option provided');
		}

		if (output.length > 2000) {
			return send(message, {
				content: `Output was too long... sent the result as a file.`,
				files: [{ attachment: Buffer.from(output), name: 'output.js' }]
			});
		}

		return send(message, output);
	}
}
