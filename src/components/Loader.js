import React, { Component } from "react";
import Slider, { Range } from 'rc-slider';
import Tooltip from 'rc-tooltip';


class Loader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      length:0,
      start:0,
      end:0
    };
  }

_fileInput = undefined;

_handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Slider.Handle value={value} {...restProps} />
    </Tooltip>
  );
};

getAudioFile = e => {
  this._fileInput = e.target;
};

readUploadedFileAsText = inputFile => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException(`Problem parsing input file.`));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };

    temporaryFileReader.readAsArrayBuffer(inputFile);
  });
};

getAudioBuffer = async () => {

  let AudioContext = window.AudioContext // Default
                  || window.webkitAudioContext // Safari and old versions of Chrome
                  || false; 

  let audioCtx = new AudioContext();
  
  if (!this._fileInput || !this._fileInput.files[0]) {
    return null;
  }

  let audioFile = await this.readUploadedFileAsText(this._fileInput.files[0]);

  // Callbacks for Safari
  audioCtx.decodeAudioData(audioFile, function(buffer) {
    let ch0 = buffer.getChannelData(0);
    this.props.onUploaded(ch0, buffer.duration);
    this.setState({length:ch0.length, start:0, end:ch0.length-1});
    this.props.rangeChange(0, ch0.length-1);
    return buffer;
  }.bind(this)); 
};

render() {
  return (
    <div id="inputControl">
      <input
        type="file"
        id="audio-file"
        accept="audio/mpeg, audio/ogg, audio/*"
        onChange={this.getAudioFile}
      />
      <button
        type="button"
        id="compress_btn"
        onClick={this.getAudioBuffer.bind(this)}
        className="btn btn-outline-primary"
      >
        Convert
      </button>
      <Range 
        min={0}
        max={this.state.length} 
        disabled={!this.state.length}
        value={[this.state.start, this.state.end]}
        handle={this._handle}
        onChange={values => {
          this.setState({start:values[0], end:values[1]});
          this.props.rangeChange(values[0], values[1]);
        }}
      />
    </div>
  );
}
}
export default Loader;
