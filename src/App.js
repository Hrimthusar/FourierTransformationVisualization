import React, { Component } from "react";
import "./App.css";

import fft from "fft-js";

import Loader from "./components/Loader"
import Controls from "./components/Controls"
import MainGraph from "./components/MainGraph"


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      songData: [...Array(10000).keys()],
      isPlaying: false
    }
  }

  onUploaded = songData => {
    this.setState({songData:songData})
  }

  onPlay = () => {
    this.setState({isPlaying:!this.state.isPlaying})
  }

  render() {
    console.log(fft);
    return (
      <div className="App">
        <Loader onUploaded={this.onUploaded}></Loader>
        <MainGraph 
          songData={this.state.songData}
          isPlaying={this.state.isPlaying}>
         </MainGraph>
        <Controls onPlay={this.onPlay}></Controls>
      </div>
    );  }
}
export default App;
