/**
 * Taken from
 * https://github.com/tholman/github-corners
 */

import React from 'react';

import './FixVersion.css';

class FixVersion extends React.Component {
  render () {
    const details = this.props.details;
    const version = details.version;

    const listClass = ['fix-version-item'];
    if (this.props.isSelected ) {
      listClass.push('selected');
    }
    return (
      <li className={listClass.join(' ')}>
        <a
          href="#"
          onClick={(evt) => {
            evt.preventDefault();
            if (!this.props.isSelected) {
              this.props.loadAndParseFixXml(details);
            }
          }}
        >{version}</a>
      </li>
    );
  }
}

FixVersion.propTypes = {
  isSelected: React.PropTypes.bool,
  details: React.PropTypes.object,
  loadAndParseFixXml: React.PropTypes.func,
};

export default FixVersion
