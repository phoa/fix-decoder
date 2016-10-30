import React from 'react';

import './FixResult.css';

class FixResult extends React.Component {
  render () {
    return (
      <div className="fix-result">
        <p
          style={{
            padding: '1em',
            fontStyle: 'italic',
          }}
        >Decoding FIX message coming soon...</p>
      </div>
    );
  }
}

export default FixResult
