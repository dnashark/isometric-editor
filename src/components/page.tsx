import { useEffect } from "react";
import Toolbar from "./toolbar";
import ViewportComponent from "./viewport";
import './page.css';
import Header from "./header";
import AppState from '../state/appstate';

interface PageProps {
  appState: AppState,
};

export default function Page(props: PageProps) {
  return (
    <div id="page">
      <Header></Header>
      <Toolbar appState={props.appState}></Toolbar>
      <div id="viewport-container">
        <ViewportComponent appState={props.appState}></ViewportComponent>
      </div>
    </div>
  );
}