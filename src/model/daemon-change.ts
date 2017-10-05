export class DaemonChange {
	path: string;
	file: string;
	type: string;
	
	public static isSane(change: DaemonChange): boolean {
		let sane = true;
		
		sane = sane && typeof change.path == "string";
		sane = sane && typeof change.file == "string";
		sane = sane && typeof change.type == "string";
		
		return sane;
	}
}
