import React, { Component } from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

class Controls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonText : `Play`,
      speed:0.000001,
      speed_min: 0.00000001,
      speed_max: 0.00001
    };
  }

  play = `Play`;
  pause = `Pause`;

  componentDidMount(){
    this.props.speedChange(this.state.speed);
  }

  render() {
    return (
      <div id="mediaControl">
        <button
          type="button"
          id="compress_btn"
          onClick={
            e=> {
              this.props.onPlay();
              this.setState({buttonText:
                this.state.buttonText === this.play
                  ? this.pause : this.play}
              );
            }
          }
          className="btn btn-outline-primary"
        >
          {this.state.buttonText}
        </button>
        <Slider step={(this.state.speed_max - this.state.speed_min)/10000} min={this.state.speed_min} max={this.state.speed_max} defaultValue={this.state.speed}
          onChange={value => {
            this.setState({speed: value});
            this.props.speedChange(value);
          }}/>
        <div style={{"whiteSpace":`nowrap`}}>
          <label htmlFor="min">Min: </label>
          <input id="min" type="number" value={this.state.speed_min}
            onChange={e => {this.setState({speed_min: parseFloat(e.target.value)});}}
          />
        </div>
        <div style={{"whiteSpace":`nowrap`}}>
          <label htmlFor="min">Max: </label>
          <input id="min" type="number" value={this.state.speed_max}
            onChange={e => {this.setState({speed_max: parseFloat(e.target.value)});}}/>
        </div>
        <div style={{"whiteSpace":`nowrap`}}>
          <label htmlFor="min">Val: </label>
          <input id="min" type="number" value={this.state.speed}
            onChange={e => {this.setState({speed: parseFloat(e.target.value)});}}/>
        </div>
      </div>
    );
  }
}
export default Controls;
