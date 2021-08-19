import React from 'react';
import Page from './components/page';
import AppState from './state/appstate';

export default class App extends React.Component {
  private appState: AppState = new AppState();

  render() {
    return <Page appState={this.appState}></Page>
  }
}