import { EventSource, Unlistener } from "./eventsource";

export interface ControllerActionState<ArgsType> {
  readonly action: ControllerAction<ArgsType>,
  readonly enable: (enabled: boolean) => void,
}

export default class ControllerAction<ArgsType = void> {
  private action: (args: ArgsType) => void;
  private enabled: boolean;
  private enabledEventSource: EventSource<boolean> = new EventSource();

  private constructor(action: (args: ArgsType) => void, enabled: boolean) {
    this.action = action;
    this.enabled = enabled;
  }

  static create<ArgsType>(action: (args: ArgsType) => void, enabled: boolean): ControllerActionState<ArgsType> {
    const controllerAction = new ControllerAction<ArgsType>(action, enabled);
    const setEnabled = (enabled: boolean) => ControllerAction.setEnabled(controllerAction, enabled);
    return { action: controllerAction, enable: setEnabled };
  }

  isEnabled(): boolean { return this.enabled; }
  isDisabled(): boolean { return !this.enabled; }

  do(args: ArgsType) { if (this.enabled) this.action(args); }

  listenForEnabled(handler: (enabled: boolean) => void): Unlistener {
    return this.enabledEventSource.listen(handler);
  }

  private static setEnabled<ArgsType>(ca: ControllerAction<ArgsType>, enabled: boolean) {
    if (enabled != ca.enabled) {
      ca.enabled = enabled;
      ca.enabledEventSource.notify(enabled);
    }
  }
}