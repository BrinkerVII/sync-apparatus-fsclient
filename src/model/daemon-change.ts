export class DaemonChange {
	uuid: string;
	length: number;
	
	public static isSane(change: DaemonChange): boolean {
		let sane = true;
		
		sane = sane && typeof change.uuid == "string";
		sane = sane && typeof change.length == "number";
		
		return sane;
	}
}
