import React from 'react';

import './Delimiter.css';

class Delimiter extends React.Component {
  render () {
    const { delimiterInput, delimiterUsed, delimiterInputOnChange} = this.props;
    return (
      <div className="fix-delimiter">
        <label
          htmlFor="fix-delimiter-input"
          className="fix-delimiter-label"
        >Delimiter</label>
        <input
          type="text"
          id="fix-delimiter-input"
          className="fix-delimiter-input"
          value={delimiterInput || ''}
          placeholder={delimiterUsed}
          onChange={delimiterInputOnChange}
        />
        <p className="input-info">Specify a delimiter, or leave empty to auto-detect.</p>
      </div>
    );
  }
}

Delimiter.propTypes = {
  delimiterUsed: React.PropTypes.string,
  delimiterInput: React.PropTypes.string,
  delimiterInputOnChange: React.PropTypes.func,
};

export default Delimiter
