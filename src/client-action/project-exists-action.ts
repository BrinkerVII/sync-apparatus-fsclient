import { ClientAction } from "./client-action";

export class ProjectExistsAction extends ClientAction {
	public execute(path: string = ""): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.parameter) {
				return reject(new Error("Parameter not set"));
			}

			this.client.get("project")
				.then((projectList: string[]) => {
					let index = projectList.indexOf(this.parameter);
					this.result = index >= 0;
					resolve();
				})
				.catch(reject);
		});
	}
}
