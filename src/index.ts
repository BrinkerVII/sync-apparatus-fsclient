import { FSWatcher } from "./fs-watcher";
import { DaemonClient } from "./daemon-client";

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
