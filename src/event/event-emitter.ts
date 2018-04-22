import { Subscription } from "./subscription";

export class EventEmitter<T> {
	private subscriptions: Subscription<T>[] = [];

	public subscribe(handlerFunction: Function): Subscription<T> {
		let subscription = new Subscription(this, handlerFunction);
		this.subscriptions.push(subscription);
		return subscription;
	}

	public removeSubscription(subscription: Subscription<T>) {
		let index = this.subscriptions.indexOf(subscription);
		if (index > 0) {
			this.subscriptions.splice(index);
		}
	}

	public emit(data: T) {
		for (let subscription of this.subscriptions) {
			subscription.emit(data);
		}
	}
}
