import { InstanceVariables } from "./instance-variables";

export class Pilot {
	private static instance: Pilot = new Pilot();

	private alive: boolean;
	private timer: NodeJS.Timer;

	private constructor() {

	}

	private loop() {

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
}
