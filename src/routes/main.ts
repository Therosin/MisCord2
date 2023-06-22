import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	/**
	 * @api {get} /api
	*/
	route: ``
})
export default class MainRoute extends Route {
	public [methods.GET](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'MisCord Online!' });
	}

	public [methods.POST](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'MisCord Online!' });
	}
}
