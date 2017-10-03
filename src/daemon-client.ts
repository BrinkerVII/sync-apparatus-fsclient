import * as request from 'request';

export class DaemonClient {
	private clientToken: string;

	constructor(
		private baseURL: string
	) {

	}

	public connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			request(`${this.baseURL}/announce`, (err, response, body) => {
				console.log(err);
				console.log(response);
				console.log(body);
				
				resolve();
			});
		});
	}
}
