import { EventSource, Unlistener } from "./eventsource";

export default class EventingState<Type> {
  private value_: Type;
  private eventSource: EventSource<Type> = new EventSource();

  constructor(initialValue: Type) {
    this.value_ = initialValue;
  }

  get value(): Type { return this.value_; }
  
  setValue(v: Type) {
    if (v == this.value_) return;
    this.value_ = v;
    this.eventSource.notify(v);
  }

  listen(listener: (v: Type) => void): Unlistener {
    return this.eventSource.listen(listener);
  }
}