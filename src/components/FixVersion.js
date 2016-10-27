/**
 * Taken from
 * https://github.com/tholman/github-corners
 */

import React from 'react';

import './FixVersion.css';

class FixVersion extends React.Component {
  render () {
    const version = this.props.details.get('version');
    const path = this.props.details.get('path');
    return (
      <li>
        <a
          href="#"
          onClick={(evt) => {
            evt.preventDefault();
            this.props.loadAndParseFixXml(path);
          }}
        >{version}</a>
      </li>
    );
  }
}

FixVersion.propTypes = {
  details: React.PropTypes.object,
  loadAndParseFixXml: React.PropTypes.func,
};

export default FixVersion
