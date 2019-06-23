import React, { Component } from "react";
import "./App.css";

import Loader from "./components/Loader";
import Controls from "./components/Controls";
import MainGraph from "./components/MainGraph";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      songData: [],
      songLength: 0,
      isPlaying: false,
      speed:0
    };
  }

  onUploaded = (songData, songLength) => {
    this.setState({songData, songLength});
  }

  rangeChange = (start, end) => {
    this.setState({start:start, end:end});
  }

  speedChange = (speed) => {
    this.setState({speed:speed});
  }

  onPlay = () => {
    this.setState({isPlaying:!this.state.isPlaying});
  }

  render() {
    return (
      <div className="App">
        <Loader 
          onUploaded={this.onUploaded}
          rangeChange={this.rangeChange}
        ></Loader>
        <MainGraph 
          songData={this.state.songData}
          songLength={this.state.songLength}
          isPlaying={this.state.isPlaying}
          start={this.state.start}
          end={this.state.end}
          speed={this.state.speed}
        >    
        </MainGraph>
        <Controls 
          onPlay={this.onPlay}
          speedChange={this.speedChange}>
        </Controls>
      </div>
    );  
  }
}
export default App;
