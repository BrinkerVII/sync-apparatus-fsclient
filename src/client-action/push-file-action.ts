import { ClientAction } from "./client-action";
import { DaemonClient } from "../daemon-client";
import * as fs from 'fs-extra-promise';
import { ProjectExistsAction } from "./project-exists-action";
import { InstanceVariables } from "../instance-variables";
import { CreateProjectAction } from "./create-project-action";
import * as debug from 'debug';

const d = debug("sync-apparatus-fsclient::push-file-action");

export class PushFileAction extends ClientAction {
	constructor(client: DaemonClient) {
		super(client);
		this.parameter = 0;
	}

	public execute(path: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (typeof this.parameter !== "number") {
				return reject(new Error("Parameter set incorrectly"));
			}

			if (this.parameter > 1) {
				return reject(new Error("Recursion overflow"));
			}
			this.parameter++;

			let pea: ProjectExistsAction = new ProjectExistsAction(this.client)
				.setParameter(InstanceVariables.project);

			d("Checking if project exists on the daemon...");
			pea.execute()
				.then(() => {
					if (pea.getResult()) {
						d("Project exists, pushing file...");
						fs.readFileAsync(path, {})
							.then((fileContents) => {
								let body = [{
									type: "file-push",
									clientToken: this.client.getToken(),
									data: {
										path: path,
										contents: fileContents.toString(),
										project: "testproject",
										encoding: "plain",
									}
								}];

								this.client.post("event", body)
									.then(response => resolve())
									.catch(reject);
							})
							.catch(reject);
					} else {
						d("Project does not exist, creating project...");

						let cpa: CreateProjectAction = new CreateProjectAction(this.client)
							.setParameter(InstanceVariables.project);

						cpa.execute()
							.then(() => {
								this.execute(path)
									.then(resolve)
									.catch(reject);
							})
							.catch(reject);
					}
				})
				.catch(reject);
		});
	}
}
