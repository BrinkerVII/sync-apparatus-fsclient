import { EventEmitter } from "./event/event-emitter";

export class GlobalEvents {	
	private static instance: GlobalEvents = new GlobalEvents();
	public static getInstance(): GlobalEvents { return GlobalEvents.instance; }

	private constructor() {

	}
	
	public gong: EventEmitter<boolean> = new EventEmitter<boolean>();
}
