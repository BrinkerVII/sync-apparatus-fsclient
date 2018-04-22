import { ClientAction } from "./client-action";

export class DeleteChangeAction extends ClientAction {
	public execute(uuid: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let endpoint = `post-office/${this.client.getToken()}/${uuid}`;

			this.client.delete(endpoint)
				.then(() => resolve())
				.catch(reject);
		});
	}
}
