import * as requestPromise from 'request-promise';

export class DaemonClient {
	private clientToken: string;

	constructor(
		private baseURL: string,
		private name: string = "Sync Apparatus FSClient"
	) {
		if (!this.baseURL.endsWith("/")) {
			this.baseURL += "/";
		}
	}

	public connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.isConnected()) {
				return reject(new Error("Cannot connect because the client is already connected"));
			}

			let options: requestPromise.Options = {
				method: "POST",
				uri: `${this.baseURL}announce`,
				body: {
					name: this.name
				},
				json: true
			};

			requestPromise(options)
				.then(body => {
					let doErorr = (errString: string) => {
						reject(new Error(errString));
					}

					if (body) {
						let clientId: string = body.clientId;
						if (typeof clientId === "string") {
							this.clientToken = clientId;
							resolve();
						} else {
							doErorr("Call returned invalid type for clientId");
						}
					} else {
						doErorr("No body returned");
					}
				})
				.catch(reject);
		});
	}

	public disconnect(force: boolean = false): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.isConnected()) {
				return reject(new Error("Cannot disconnect the client because it is not connected"));
			}

			let options: requestPromise.Options = {
				method: "DELETE",
				uri: `${this.baseURL}client`,
				body: {
					clientToken: this.clientToken
				},
				json: true
			};

			let deleteToken = () => {
				this.clientToken = null;
			};

			requestPromise(options)
				.then(() => {
					deleteToken();
					resolve();
				})
				.catch(err => {
					if (force) {
						deleteToken();
					}

					reject(err);
				});
		});
	}

	public get(endpoint: string): Promise<any> {		
		return new Promise((resolve, reject) => {
			if (!this.isConnected()) {
				return reject(new Error("Cannot GET, because the client is not connected"));
			}
			
			let options: requestPromise.Options = {
				method: "GET",
				uri: `${this.baseURL}${endpoint}`,
				json: true
			};

			requestPromise(options)
				.then(resolve)
				.catch(reject);
		});
	}

	public post(endpoint: string, body: any): Promise<any> {
		return new Promise((resolve, reject) => {
			if (!this.isConnected()) {
				return reject(new Error("Cannot POST, because the client is not connected"));
			}
			
			let options: requestPromise.Options = {
				method: "POST",
				uri: `${this.baseURL}${endpoint}`,
				body: body,
				json: true
			};

			requestPromise(options)
				.then(resolve)
				.catch(reject);
		});
	}

	public delete(endpoint: string, body?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			if (!this.isConnected()) {
				return reject(new Error("Cannot DELETE, because the client is not connected"));
			}
			
			let options: requestPromise.Options = {
				method: "DELETE",
				uri: `${this.baseURL}${endpoint}`,
				json: true
			};

			if (body) {
				options.body = body;
			}

			requestPromise(options)
				.then(resolve)
				.catch(reject);
		});
	}

	public isConnected(): boolean {
		return !!this.clientToken;
	}
}
