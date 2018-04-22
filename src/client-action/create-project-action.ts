import { ClientAction } from "./client-action";

export class CreateProjectAction extends ClientAction {
	public execute(path: string = ""): Promise<void> {
		return new Promise((resolve, reject) => {
			if (typeof this.parameter !== "string") {
				return reject(new Error("Parameter set incorrectly"));
			}

			this.client.post("project", { name: this.parameter })
				.then(resolve)
				.catch(reject);
		});
	}
}
