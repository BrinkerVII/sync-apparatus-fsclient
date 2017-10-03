import * as chokidar from 'chokidar';
import * as debug from 'debug';
import { DaemonClient } from './daemon-client';
import { PushFileAction } from './client-action/push-file-action';

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

	public bind(): FSWatcher {
		this.watcher
			.on("ready", () => {
				d("Chokidar watcher is ready");
			})
			.on("add", (path, stats) => {
				d(`Path addded ${path}`);

				new PushFileAction(this.client)
					.execute(path);
			})
			.on("change", (path, stats) => {
				d(`Path changed ${path}`);
			})
			.on("unlink", path => {
				d(`Path removed ${path}`);
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
