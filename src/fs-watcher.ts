import * as chokidar from 'chokidar';
import * as debug from 'debug';
import { DaemonClient } from './daemon-client';
import { PushFileAction } from './client-action/push-file-action';
import { DeleteFileAction } from './client-action/delete-file-action';

let d = debug("sync-apparatus-fsclient::fs-watcher");

export class FSWatcher {
	private watcher: chokidar.FSWatcher;
	private client: DaemonClient;

	constructor(
		private path: string
	) {
		let options: chokidar.WatchOptions = {
			persistent: true
		}
		this.watcher = chokidar.watch(this.path, options);
	}

	private doPushFile(path: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			new PushFileAction(this.client)
				.execute(path)
				.then(() => {
					d("Successfully pushed file");
					resolve();
				})
				.catch(reject);
		});
	}

	public bind(): FSWatcher {
		this.watcher
			.on("ready", () => {
				d("Chokidar watcher is ready");
			})
			.on("add", (path, stats) => {
				d(`Path addded ${path}`);
				this.doPushFile(path)
					.then(() => { })
					.catch(console.error);
			})
			.on("change", (path, stats) => {
				d(`Path changed ${path}`);
				this.doPushFile(path)
					.then(() => { })
					.catch(console.error);
			})
			.on("unlink", path => {
				d(`Path removed ${path}`);

				new DeleteFileAction(this.client).execute(path)
					.then(() => { })
					.catch(console.error);
			})
			.on("addDir", (path, stats) => {
				d(`Directory added ${path}`);
			})
			.on("unlinkDir", path => {
				d(`Directory removed ${path}`);
			})
			.on("error", path => {
				console.error(path);
			});

		return this;
	}

	public useClient(client: DaemonClient): FSWatcher {
		this.client = client;
		return this;
	}
}
