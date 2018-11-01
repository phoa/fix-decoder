import React from 'react';
import PropTypes from 'prop-types';

import styles from './ButtonAsA.module.css';

function ButtonAsA(props) {
  let { customClass, additionalClass, ...restProps } = props;
  let buttonClass = [customClass || styles.buttonAsA];

  if (additionalClass) {
    buttonClass.push(additionalClass);
  }

  buttonClass = buttonClass.join(' ');
  return (
    <button className={buttonClass} {...restProps}>
      {props.children}
    </button>
  );
}

ButtonAsA.propTypes = {
  customClass: PropTypes.object,
  additionalClass: PropTypes.object,
  onClick: PropTypes.func
};

export default ButtonAsA;
