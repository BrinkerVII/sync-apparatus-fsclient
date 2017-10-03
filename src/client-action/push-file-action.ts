import { ClientAction } from "./client-action";
import { DaemonClient } from "../daemon-client";

export class PushFileAction extends ClientAction {
	constructor(client: DaemonClient) {
		super(client);
	}
	
	public execute(path: string) {

	}
}
