import { DaemonClient } from "../daemon-client";

export class ClientAction {
	protected parameter: any;
	protected result: any;

	constructor(protected client: DaemonClient) {

	}

	public execute(path: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			resolve();
		});
	}

	public setParameter(value: any): ClientAction {
		this.parameter = value;
		return this;
	}

	public getResult(): any {
		return this.result;
	}

	public hasResult(): boolean {
		return !!this.result;
	}
}
