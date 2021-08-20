import React from 'react';
import classnames from '../classnames';
import AppState from '../state/appstate';
import ControllerAction from '../state/controlleraction';
import { Unlistener } from '../state/eventsource';
import { Tool } from '../state/toolbelt';
import './toolbar.css';

interface ToolbarProps {
  appState: AppState,
}

interface ToolbarState {
  newDisabled: boolean,
  closeDisabled: boolean,
  addDisabled: boolean,
  deleteDisabled: boolean,
  selectedTool: Tool | null,
}

export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
  private unlisteners: Array<Unlistener> = [];

  constructor(props: ToolbarProps) {
    super(props);

    this.state = {
      newDisabled: props.appState.newImage.isDisabled(),
      closeDisabled: props.appState.closeImage.isDisabled(),
      addDisabled: props.appState.isToolDisabled(Tool.ADD),
      deleteDisabled: props.appState.isToolDisabled(Tool.DELETE),
      selectedTool: props.appState.getSelectedTool(),
    };
  }

  render() {
    return (
      <div className="toolbar">
        <div className={classnames({
          button: true,
          disabled: this.state.newDisabled,
        })} onClick={() => this.props.appState.newImage.do()}>New</div>
        <div className={classnames({
          button: true,
          disabled: this.state.closeDisabled,
        })} onClick={() => this.props.appState.closeImage.do()}>Close</div>
        <div className={classnames({
          button:true,
          disabled: this.state.addDisabled,
          selected: this.props.appState.getSelectedTool() == Tool.ADD,
        })} onClick={() =>this.props.appState.selectTool(Tool.ADD)}>Add</div>
        <div className={classnames({
          button:true,
          disabled: this.state.deleteDisabled,
          selected: this.props.appState.getSelectedTool() == Tool.DELETE
        })} onClick={() =>this.props.appState.selectTool(Tool.DELETE)}>DELETE</div>
      </div>
    );
  }

  componentDidMount() {
    this.listenForControllerActionEnabled(this.props.appState.newImage, 'newDisabled');
    this.listenForControllerActionEnabled(this.props.appState.closeImage, 'closeDisabled');
    this.listenForToolEnabled(this.props.appState, Tool.ADD, 'addDisabled');
    this.listenForToolEnabled(this.props.appState, Tool.DELETE, 'deleteDisabled');
    this.listenForToolSelected(this.props.appState);
  }

  componentWillUnmount() {
    this.unlisteners.forEach(unlistener => unlistener());
    this.unlisteners = [];
  }

  listenForControllerActionEnabled(action: ControllerAction, stateKey: keyof ToolbarState) {
    const callback = (enabled: boolean) => this.setState({
      [stateKey]: !enabled
    } as unknown as Pick<ToolbarState, keyof ToolbarState>);
    this.unlisteners.push(action.listenForEnabled(callback));
  }

  listenForToolEnabled(appState: AppState, tool: Tool, stateKey: keyof ToolbarState) {
    const callback = (enabled: boolean) => this.setState({
      [stateKey]: !enabled
    } as unknown as Pick<ToolbarState, keyof ToolbarState>);
    this.unlisteners.push(appState.listenForToolEnabled(tool, callback));
  }

  listenForToolSelected(appState: AppState) {
    const callback = (tool: Tool | null) => this.setState({
      selectedTool: tool
    });
    this.unlisteners.push(appState.listenForToolSelected(callback));
  }
}
