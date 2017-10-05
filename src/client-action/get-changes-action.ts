import { ClientAction } from "./client-action";
import { InstanceVariables } from "../instance-variables";
import { DaemonChange } from "../model/daemon-change";
import * as debug from 'debug';
import * as nodePath from 'path';
import * as fs from 'fs-extra-promise';

const d = debug("sync-apparatus-fsclient::get-changes-action");

export class GetChangesAction extends ClientAction {
	private processChange(change: DaemonChange): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let realPath = nodePath.join(InstanceVariables.watch_path, change.path);

			if (change.type === "add" || change.type === "update") {
				fs.writeFileAsync(realPath, change.file)
					.then(() => {
						resolve();
					})
					.catch(reject);
			} else if (change.type == "delete") {
				fs.removeAsync(realPath)
					.then(() => resolve())
					.catch(reject);
			} else if (change.type == "none") {
				reject(new Error("Got NOP as change type"));
			} else {
				reject(new Error("Unsupported change type"));
			}
		});
	}

	public execute(path: string = ""): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let endpoint = `changes/${this.client.getToken()}/${InstanceVariables.project}`;

			this.client.get(endpoint)
				.then((response: DaemonChange[]) => {
					for (let change of response) {
						this.processChange(change)
							.then(() => {
								d(`Processed change for path ${change.path}`);
							})
							.catch(reject)
					}
				})
				.catch(reject);
		});
	}
}
