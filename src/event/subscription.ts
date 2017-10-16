import { EventEmitter } from "./event-emitter";

export class Subscription<T> {
	private errorHandlerFunction: Function;

	public constructor(
		private parent: EventEmitter<T>,
		private handlerFunction: Function
	) {

	}

	public unsubscribe() {
		this.parent.removeSubscription(this);
		this.parent = null;
		this.handlerFunction = null;
	}

	public emit(data: T) {
		let execute = () => {
			this.handlerFunction(data);
		}

		if (this.errorHandlerFunction) {
			execute();
		} else {
			try {
				execute();
			} catch (e) {
				let err: Error;
				if (typeof e === "string") {
					err = new Error(e);
				} else {
					err = <Error>e;
				}

				this.errorHandlerFunction(err);
			}
		}
	}

	public catch(errorHandlerFunction: Function): Subscription<T> {
		this.errorHandlerFunction = errorHandlerFunction;
		return this;
	}
}
