import { ClientAction } from "./client-action";

export class DownloadChangeFileAction extends ClientAction {
	public execute(changeId: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let endpoint = `post-office/${this.client.getToken()}/${changeId}`;

			this.client.get(endpoint)
				.then(changeContent => {
					this.result = changeContent;
					resolve();
				})
				.catch(reject);
		});
	}
}
