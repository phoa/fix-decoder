import React from 'react';

import './FixResult.css';

class FixResult extends React.Component {
  render () {
    let content = null;

    if (this.props.decodedFixMessage) {
      content = this.props.decodedFixMessage.map((item, i) => {
        if (item === null) {
          return (<div key={i}></div>);
        }

        const raw = item.raw;
        const decoded = item.decoded;

        return (
          <div key={i}
            className="fix-result-item"
          >
            <div className="fix-result-col">{raw.tag}</div>
            <div className="fix-result-col">{raw.value}</div>
            <div className="fix-result-col">{decoded.tag}</div>
            <div className="fix-result-col">{decoded.value}</div>
          </div>
        );
      });
    }

    return (
      <div className="fix-result">
        <p
          style={{
            padding: '1em',
            fontStyle: 'italic',
          }}
        >Styling coming soon...</p>
        {content}
      </div>
    );

    // return (
    //   <div className="fix-result">
    //     <p
    //       style={{
    //         padding: '1em',
    //         fontStyle: 'italic',
    //       }}
    //     >Decoding FIX message coming soon...</p>
    //   </div>
    // );
  }
}

FixResult.propTypes = {
  decodedFixMessage: React.PropTypes.any,
};

export default FixResult
