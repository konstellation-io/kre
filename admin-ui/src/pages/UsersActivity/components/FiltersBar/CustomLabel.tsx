import React, { FC } from 'react';
import cx from 'classnames';
import styles from './FiltersBar.module.scss';

export enum HIGHLIGHT_COLORS {
  DEFAULT = 'highlight',
  INFO = 'feedback',
  SUCCESS = 'success',
  GREY = 'regular'
}
type Props = {
  children: string;
  highlight?: string;
  color?: HIGHLIGHT_COLORS;
};
const CustomLabel: FC<Props> = ({ children, highlight, color }) => {
  const highlightedText = highlight;
  const normalText = children.replace(highlight || '', '');

  return (
    <div className={styles.customLabel}>
      <span>{normalText}</span>
      {highlightedText && (
        <span className={cx(styles.customLabelHighlight, styles[color || ''])}>
          {highlightedText}
        </span>
      )}
    </div>
  );
};

export default CustomLabel;
