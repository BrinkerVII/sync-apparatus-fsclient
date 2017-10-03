import { FSWatcher } from "./fs-watcher";
import { DaemonClient } from "./daemon-client";
import * as DEATH from 'death';

const ON_DEATH = DEATH({ uncaughtException: true });

let client = new DaemonClient("http://localhost:3000");
client.connect()
	.then(() => {
		let testWatcher = new FSWatcher("./tmp")
			.useClient(client)
			.bind();
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
});
