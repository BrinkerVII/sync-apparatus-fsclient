import { InstanceVariables } from "./instance-variables";
import { DaemonClient } from "./daemon-client";
import { GetChangesAction } from "./client-action/get-changes-action";
import * as debug from 'debug';

const d = debug("sync-apparatus-fsclient::pilot");

export class Pilot {
	private static instance: Pilot = new Pilot();
	public static getInstance(): Pilot {
		return Pilot.instance;
	}

	private alive: boolean;
	private timer: NodeJS.Timer;
	private client: DaemonClient;

	private constructor() {

	}

	private loop() {
		let gca = new GetChangesAction(this.client)
			.execute()
			.then(() => { })
			.catch(err => {
				console.error(err);
				d("Failed to fetch changes");
			});
	}

	public start(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this.alive) {
				return reject(new Error("Pilot is already running"));
			}
			this.alive = true;

			this.timer = setInterval(() => {
				this.loop();
			}, InstanceVariables.pilot_interval);

			resolve();
		});
	}

	public stop(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (!this.alive) {
				return reject(new Error("Cannot stop pilot because it is not running"));
			}

			clearInterval(this.timer);
			resolve();
		});
	}

	public useClient(client: DaemonClient): Pilot {
		this.client = client;
		return this;
	}
}
