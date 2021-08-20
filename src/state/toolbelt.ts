import ControllerAction, { ControllerActionState } from "./controlleraction";
import EventingState from "./eventingstate";
import { EventSource, Unlistener } from "./eventsource";

export enum Tool {
  ADD = 'ADD',
  DELETE = 'DELETE',
}

type ToolMap<Type> = { [tool in Tool]: Type };

function createToolMap<Type>(getValue: () => Type): ToolMap<Type> {
  return Object.fromEntries(Object.values(Tool).map(v => [v, getValue()])) as ToolMap<Type>;
}

export class Toolbelt {
  private selectedTool: EventingState<Tool | null> = new EventingState<Tool | null>(null);
  private enabled: ToolMap<EventingState<boolean>> = createToolMap(() => new EventingState<boolean>(false));

  select(tool: Tool | null) {
    if (tool && !this.enabled[tool]) return;
    this.selectedTool.setValue(tool);
  }

  getSelectedTool(): Tool | null { return this.selectedTool.value; }

  isEnabled(tool: Tool): boolean { return this.enabled[tool].value; }
  isSelected(tool: Tool): boolean { return this.selectedTool.value == tool; }

  setEnabled(enabled: boolean, ...tools: Tool[]): void {
    tools.forEach((tool) => this.enabled[tool].setValue(enabled));
  }

  enable(...tools: Tool[]): void { this.setEnabled(true, ...tools); }
  disable(...tools: Tool[]): void { this.setEnabled(false, ...tools); }

  listenForEnabled(tool: Tool, listener: (selected: boolean) => void): Unlistener {
    return this.enabled[tool].listen(listener);
  }

  listenForSelected(listener: (tool: Tool | null) => void): Unlistener {
    return this.selectedTool.listen(listener);
  }
}