import React, { Component } from "react";

class Controls extends Component {
  render() {
    return (
      <fieldset>
        <button
          type="button"
          id="compress_btn"
          onClick={this.props.onPlay}
          className="btn btn-outline-primary"
        >
          Play
        </button>
      </fieldset>
    );
  }
}
export default Controls;