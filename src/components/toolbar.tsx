import React from 'react';
import classnames from '../classnames';
import AppState from '../state/appstate';
import ControllerAction from '../state/controlleraction';
import { Unlistener } from '../state/eventsource';
import './toolbar.css';

interface ToolbarProps {
  appState: AppState,
}

interface ToolbarState {
  newDisabled: boolean,
  closeDisabled: boolean,
}

export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
  private unlisteners: Array<Unlistener> = [];

  constructor(props: ToolbarProps) {
    super(props);

    this.state = {
      newDisabled: props.appState.newImage.isDisabled(),
      closeDisabled: props.appState.closeImage.isDisabled(),
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
      </div>
    );
  }

  componentDidMount() {
    this.listenForEnabled(this.props.appState.newImage, 'newDisabled');
    this.listenForEnabled(this.props.appState.closeImage, 'closeDisabled');
  }

  componentWillUnmount() {
    this.unlisteners.forEach(unlistener => unlistener());
    this.unlisteners = [];
  }

  listenForEnabled(action: ControllerAction, stateKey: keyof ToolbarState) {
    const callback = (enabled: boolean) => this.setState({
      [stateKey]: !enabled
    } as Pick<ToolbarState, keyof ToolbarState>)
    this.unlisteners.push(action.listenForEnabled(callback));
  }
}
