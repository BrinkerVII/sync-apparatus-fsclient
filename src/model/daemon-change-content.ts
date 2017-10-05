export class DaemonChangeContent {
	path: string;
	file: string;
	type: string;
	
	public static isSane(changeContent: DaemonChangeContent): boolean {
		let sane = true;
		
		sane = sane && typeof changeContent.path === "string";
		sane = sane && typeof changeContent.file === "string";
		sane = sane && typeof changeContent.type === "string";
		
		return sane;
	}
}
