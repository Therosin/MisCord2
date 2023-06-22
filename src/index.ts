import { MiscordClient } from './structures/Miscord';
import './lib/setup';
import { RegisterTasks } from './MiscordTasks';

const miscord = new MiscordClient();


const main = async () => {
	try {
		miscord.logger.info('Logging in');
		await miscord.login(process.env.DISCORD_TOKEN as string);
		miscord.logger.info('logged in');
		RegisterTasks(miscord).then((taskManager) => {
			setInterval(() => {
				taskManager.runTasks();
			}, 1000);
		});
	} catch (error) {
		miscord.logger.fatal(error);
		miscord.destroy();
		process.exit(1);
	}
};

main();
