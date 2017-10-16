import * as DEATH from 'death';;
import * as debug from 'debug';
import { DaemonClient } from '../daemon-client';
import { FSWatcher } from '../fs-watcher';
import { Pilot } from '../pilot';
import { InstanceVariables } from '../instance-variables';

const ON_DEATH = DEATH({ uncaughtException: true });
const d = debug("sync-apparatus-fsclient::index");

let client = new DaemonClient("http://localhost:3000");
client.connect()
	.then(() => {
		let testWatcher = new FSWatcher(InstanceVariables.watch_path)
			.useClient(client)
			.bind();

		Pilot.getInstance().useClient(client)
			.start()
			.then(() => {
				d("Started pilot");
			})
			.catch(err => {
				d("Failed to start pilot!");
				console.error(err);
			});
	})
	.catch(err => {
		console.error("Failed to connect");
		console.error(err);
		process.exit();
	});

ON_DEATH((signal, err) => {
	console.log(`Received signal ${signal}`);
	client.disconnect(true)
		.then(() => console.log("Client disconnected before process exit"))
		.catch(console.error);

	Pilot.getInstance().stop()
		.then(() => "Stopped the pilot before process exit")
		.catch(console.error);
});
