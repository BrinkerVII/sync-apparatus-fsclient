import { ClientAction } from "./client-action";
import { InstanceVariables } from "../instance-variables";
import * as debug from 'debug';
import * as nodePath from 'path';
import * as fs from 'fs-extra-promise';
import { DaemonChangeContent } from "../model/daemon-change-content";
import { DaemonChange } from "../model/daemon-change";
import { DeleteChangeAction } from "./delete-change-action";
import { DownloadChangeFileAction } from "./download-change-file-action";
import { GlobalEvents } from "../global-events";

const d = debug("sync-apparatus-fsclient::get-contents-action");

export class GetChangesAction extends ClientAction {
	private processChange(change: DaemonChange, content: DaemonChangeContent): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let realPath = nodePath.join(InstanceVariables.watch_path, content.path);
			d(`Processing contents for path ${realPath} with type ${content.type}`);
			
			let onError = (...args) => {
				GlobalEvents.getInstance().gong.emit(false);
				reject(...args);
			};

			GlobalEvents.getInstance().gong.emit(true);
			if (content.type === "add" || content.type === "update") {
				let dir = nodePath.dirname(realPath);
				d(`dirname is ${dir}, checking if it exists...`);

				let deleteChange = () => {
					let dca = new DeleteChangeAction(this.client)
						.execute(change.uuid)
						.then(() => resolve())
						.catch(onError);
				}

				let doWrite = () => {
					fs.writeFileAsync(realPath, content.file)
						.then(() => {
							deleteChange();
						})
						.catch(onError);
				}

				let doMkDirs = () => {
					d("Directory does not exist, attempting to make directory");
					fs.mkdirsAsync(dir)
						.then(() => doWrite())
						.catch(onError);
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
			} else if (content.type == "delete") {
				fs.removeAsync(realPath)
					.then(() => resolve())
					.catch(onError);
			} else if (content.type == "none") {
				onError(new Error("Got NOP as content type"));
			} else {
				onError(new Error("Unsupported content type"));
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
										this.processChange(change, dcfa.getResult())
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
