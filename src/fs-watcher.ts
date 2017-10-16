import * as chokidar from 'chokidar';
import * as debug from 'debug';
import { DaemonClient } from './daemon-client';
import { PushFileAction } from './client-action/push-file-action';
import { DeleteFileAction } from './client-action/delete-file-action';
import { GlobalEvents } from './global-events';

let d = debug("sync-apparatus-fsclient::fs-watcher");

export class FSWatcher {
	private watcher: chokidar.FSWatcher;
	private client: DaemonClient;
	private deafened: boolean = false;

	constructor(
		private path: string
	) {
		GlobalEvents.getInstance().gong.subscribe(deafened => {
			this.deafened = deafened;
			d(`Changed FSWatcher deafened state to ${this.deafened}`);
		});
		
		let options: chokidar.WatchOptions = {
			persistent: true
		}
		this.watcher = chokidar.watch(this.path, options);
	}

	private doPushFile(path: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this.deafened) {
				return d("FSWatchers are deafened");
			}

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
				if (this.deafened) {
					return d("FSWatchers are deafened");
				}

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
