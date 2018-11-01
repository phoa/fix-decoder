/**
 * Taken from
 * https://github.com/tholman/github-corners
 */

import React from 'react';
import PropTypes from 'prop-types';

import ButtonAsA from './ButtonAsA';
import styles from './FixVersionItem.module.css';

function FixVersionItem(props) {
  const { details } = props;
  const { version, filename } = details;

  const label = filename ? filename : version;

  const onClick = evt => {
    evt.preventDefault();
    if (!props.isSelected) {
      props.loadAndParseFixXml(details);
    }
  };

  const listClass = [styles['fix-version-item']];
  if (props.isSelected) {
    listClass.push(styles['selected']);
  }
  return (
    <div className={listClass.join(' ')}>
      <ButtonAsA onClick={onClick}>{label}</ButtonAsA>
    </div>
  );
}

FixVersionItem.propTypes = {
  isSelected: PropTypes.bool,
  details: PropTypes.object,
  loadAndParseFixXml: PropTypes.func
};

export default FixVersionItem;
