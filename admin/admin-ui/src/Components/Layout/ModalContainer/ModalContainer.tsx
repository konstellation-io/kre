import Button, { BUTTON_THEMES } from '../../Button/Button';
import React, { FunctionComponent, MouseEvent } from 'react';

import HorizontalBar from '../HorizontalBar/HorizontalBar';
import cx from 'classnames';
import styles from './ModalContainer.module.scss';

type Props = {
  title: string;
  actionButtonLabel?: string;
  to?: string;
  blocking?: boolean;
  warning?: boolean;
  onAccept?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancel?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
  autofocusOnAccept?: boolean;
  confirmationTimer?: number;
};

const ModalContainer: FunctionComponent<Props> = ({
  children,
  title,
  actionButtonLabel = 'ACCEPT',
  to = '',
  blocking = false,
  warning = false,
  onAccept = function() {},
  onCancel = function() {},
  className = '',
  autofocusOnAccept = false,
  confirmationTimer
}) => {
  return (
    <>
      {blocking && <div className={styles.bg} />}
      <div className={cx(className, styles.container, 'modal', {})}>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <HorizontalBar>
            <Button
              primary
              label={actionButtonLabel}
              to={to}
              onClick={onAccept}
              height={30}
              tabIndex={0}
              autofocus={autofocusOnAccept}
              theme={warning ? BUTTON_THEMES.WARN : BUTTON_THEMES.DEFAULT}
              timeToEnable={confirmationTimer}
            />
            <Button
              label={'CANCEL'}
              onClick={onCancel}
              height={30}
              tabIndex={0}
            />
          </HorizontalBar>
        </div>
      </div>
    </>
  );
};

export default ModalContainer;
