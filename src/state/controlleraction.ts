import { EventSource, Unlistener } from "./eventsource";

export interface ControllerActionState {
  readonly action: ControllerAction,
  readonly enable: (enabled: boolean) => void,
}

export default class ControllerAction {
  private action: () => void;
  private enabled: boolean;
  private enabledEventSource: EventSource<boolean> = new EventSource();

  private constructor(action: () => void, enabled: boolean) {
    this.action = action;
    this.enabled = enabled;
  }

  static create(action: () => void, enabled: boolean): ControllerActionState {
    const controllerAction = new ControllerAction(action, enabled);
    const setEnabled = (enabled: boolean) => ControllerAction.setEnabled(controllerAction, enabled);
    return { action: controllerAction, enable: setEnabled };
  }

  isEnabled(): boolean { return this.enabled; }
  isDisabled(): boolean { return !this.enabled; }

  do() { if (this.enabled) this.action(); }

  listenForEnabled(handler: (enabled: boolean) => void): Unlistener {
    return this.enabledEventSource.listen(handler);
  }

  private static setEnabled(ca: ControllerAction, enabled: boolean) {
    if (enabled != ca.enabled) {
      ca.enabled = enabled;
      ca.enabledEventSource.notify(enabled);
    }
  }
}