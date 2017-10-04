import { ClientAction } from "./client-action";
import { ProjectExistsAction } from "./project-exists-action";
import { InstanceVariables } from "../instance-variables";

export class DeleteFileAction extends ClientAction {
	public execute(path: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let pea: ProjectExistsAction = new ProjectExistsAction(this.client)
				.setParameter(InstanceVariables.project);

			pea.execute()
				.then(() => {
					if (pea.getResult()) {
						let body = [{
							type: "file-delete",
							clientToken: this.client.getToken(),
							data: {
								path: path,
								project: InstanceVariables.project
							}
						}];

						this.client.post("event", body)
							.then(() => resolve())
							.catch(reject);
					} else {
						reject(new Error("Project does not exist"));
					}
				})
				.catch(reject)
		});
	}
}
