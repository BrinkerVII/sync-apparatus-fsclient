import { ClientAction } from "./client-action";
import { InstanceVariables } from "../instance-variables";
import { DaemonChange } from "../model/daemon-change";
import * as debug from 'debug';
import * as nodePath from 'path';
import * as fs from 'fs-extra-promise';
import { DaemonChangeContent } from "../model/daemon-change-content";
import { DownloadChangeFileAction } from "./download-change-file-action";

const d = debug("sync-apparatus-fsclient::get-changes-action");

export class GetChangesAction extends ClientAction {
	private processChange(change: DaemonChangeContent): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let realPath = nodePath.join(InstanceVariables.watch_path, change.path);
			d(`Processing changes for path ${realPath} with type ${change.type}`);

			if (change.type === "add" || change.type === "update") {
				let dir = nodePath.dirname(realPath);
				d(`dirname is ${dir}, checking if it exists...`);

				let doWrite = () => {
					fs.writeFileAsync(realPath, change.file)
						.then(() => {
							resolve();
						})
						.catch(reject);
				}

				let doMkDirs = () => {
					d("Directory does not exist, attempting to make directory");
					fs.mkdirsAsync(dir)
						.then(() => doWrite())
						.catch(reject);
				}

				fs.isDirectoryAsync(dir)
					.then(stat => {
						d("Resolved isDirectoryAsync");

						if (stat) {
							d("Directory exists, attempting write");
							doWrite();
						} else {
							doMkDirs();
						}
					})
					.catch(err => {
						doMkDirs();
					});
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
						if (DaemonChange.isSane(change)) {
							let dcfa = new DownloadChangeFileAction(this.client);
							dcfa.execute(change.uuid)
								.then(() => {
									if (dcfa.hasResult()) {
										this.processChange(dcfa.getResult())
											.then(() => {
												d(`Processed change with uuid '${change.uuid}'`);
											})
											.catch(reject)
									} else {
										reject(new Error("Did not get change content from the post office"));
									}
								})
								.catch(reject);
						} else {
							console.error("Got some insane data from the daemon");
						}
					}
				})
				.catch(reject);
		});
	}
}
