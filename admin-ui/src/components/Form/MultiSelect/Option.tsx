import React from 'react';
import Check from '../Check/Check';
import cx from 'classnames';
import styles from './MultiSelect.module.scss';

type Props<T> = {
  label: T;
  Icon: JSX.Element;
  selected: boolean;
  onChange: (label: T, checked: boolean) => void;
  iconAtStart: boolean;
  customLabel?: JSX.Element;
};

function Option<T>({
  label,
  Icon,
  selected,
  onChange,
  iconAtStart,
  customLabel
}: Props<T>) {
  return (
    <div className={cx(styles.optionContainer)}>
      <Check
        checked={selected}
        onChange={(checked: boolean) => onChange(label, checked)}
      />
      <div
        className={cx(styles.body, {
          [styles.reverse]: iconAtStart
        })}
      >
        <div className={styles.label}>{customLabel || label}</div>
        <div className={styles.icon}>{Icon}</div>
      </div>
    </div>
  );
}

export default Option;
