import React from 'react';
import PropTypes from 'prop-types';

import './Delimiter.css';

function Delimiter(props) {
  const { delimiterInput, delimiterUsed, delimiterInputOnChange } = props;

  const placeholder = delimiterUsed || `¯\\_(ツ)_/¯`;

  return (
    <div className="fix-delimiter">
      <label htmlFor="fix-delimiter-input" className="fix-delimiter-label">
        Delimiter
      </label>
      <input
        type="text"
        id="fix-delimiter-input"
        className="fix-delimiter-input"
        value={delimiterInput || ''}
        placeholder={placeholder}
        onChange={delimiterInputOnChange}
      />
      <p className="input-info">
        Specify a delimiter, or leave empty to auto-detect.
      </p>
    </div>
  );
}

Delimiter.propTypes = {
  delimiterUsed: PropTypes.string,
  delimiterInput: PropTypes.string,
  delimiterInputOnChange: PropTypes.func
};

export default Delimiter;
