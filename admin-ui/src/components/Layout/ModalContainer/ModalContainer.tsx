import React, { MouseEvent, FunctionComponent } from 'react';

import HorizontalBar from '../../Layout/HorizontalBar/HorizontalBar';
import Button from '../../Button/Button';

import cx from 'classnames';
import styles from './ModalContainer.module.scss';

type Props = {
  title: string;
  actionButtonLabel?: string;
  to?: string;
  blocking?: boolean;
  onAccept?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancel?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
};

const ModalContainer: FunctionComponent<Props> = ({
  children,
  title,
  actionButtonLabel = 'ACCEPT',
  to = '',
  blocking = false,
  onAccept = function() {},
  onCancel = function() {},
  className = ''
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
              style={{ width: '122px', padding: '0 0' }}
            />
            <Button
              label={'CANCEL'}
              onClick={onCancel}
              height={30}
              style={{ width: '122px', padding: '0 0' }}
            />
          </HorizontalBar>
        </div>
      </div>
    </>
  );
};

export default ModalContainer;
