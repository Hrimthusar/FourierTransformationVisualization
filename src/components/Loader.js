import React, { Component } from "react";

class Loader extends Component {
  _fileInput = undefined;

  getAudioFile = e => {
    this._fileInput = e.target;
  };

  readUploadedFileAsText = inputFile => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };

      temporaryFileReader.readAsArrayBuffer(inputFile);
    });
  };

  getAudioBuffer = async () => {
    let audioCtx = new AudioContext();

    if (!this._fileInput || !this._fileInput.files[0]) {
      return null;
    }

    let audioFile = await this.readUploadedFileAsText(this._fileInput.files[0]);
    audioCtx.decodeAudioData(audioFile).then(
      function(buffer) {
        this.props.onUploaded(buffer.getChannelData(0));
        return buffer;
      }.bind(this)
    );
  };

  render() {
    return (
      <fieldset>
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
          Compress
        </button>
      </fieldset>
    );
  }
}
export default Loader;
