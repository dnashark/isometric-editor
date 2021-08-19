export type EventHandler = (e?: any) => void;

export type Unlistener = () => void;

export class EventSource<ArgType> {
  private listeners: Array<[Object, (arg: ArgType) => void]> = [];

  listen(handler: (arg: ArgType) => void): Unlistener {
    const token = {};
    this.listeners.push([token, handler]);
    return () => this.unlisten(token);
  }

  private unlisten(token: Object) {
    this.listeners = this.listeners.filter((listener) => listener[0] != token);
  }

  notify(arg: ArgType) {
    this.listeners.forEach((listener) => listener[1](arg));
  }
}
