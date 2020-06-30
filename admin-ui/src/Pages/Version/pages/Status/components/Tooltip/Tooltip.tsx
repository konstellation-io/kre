import '../../icons/icons.scss';

import React, { FunctionComponent, MouseEvent, RefObject } from 'react';

import { NodeStatus } from 'Graphql/types/globalTypes';
import SvgIcon from '@material-ui/core/SvgIcon';
import cx from 'classnames';
import styles from './Tooltip.module.scss';

export type TooltipHeader = {
  Icon: JSX.Element | null;
  title: string;
};

type Props = {
  tooltipRef: RefObject<HTMLDivElement>;
  tooltipHeaderRef: RefObject<HTMLDivElement>;
  tooltipContentRef: RefObject<HTMLDivElement>;
  tooltipVisible: boolean;
  onTooltipEnter: (event: MouseEvent<HTMLDivElement>) => void;
  onTooltipLeave: (event: MouseEvent<HTMLDivElement>) => void;
  tooltipHeader: TooltipHeader;
  tooltipStatus: NodeStatus;
};

const Tooltip: FunctionComponent<Props> = ({
  tooltipRef,
  tooltipHeaderRef,
  tooltipContentRef,
  tooltipVisible,
  onTooltipEnter,
  onTooltipLeave,
  tooltipHeader,
  tooltipStatus,
  children
}) => {
  return (
    <div
      className={cx(styles.wrapper, styles[tooltipStatus], {
        [styles.show]: tooltipVisible
      })}
      onMouseEnter={onTooltipEnter}
      onMouseLeave={onTooltipLeave}
      ref={tooltipRef}
    >
      <div className={styles.container} ref={tooltipRef}>
        <div className={styles.header} ref={tooltipHeaderRef}>
          <SvgIcon className={cx('icon-regular', tooltipStatus)}>
            {tooltipHeader.Icon}
          </SvgIcon>
          <div className={styles.title}>{tooltipHeader.title}</div>
        </div>
        <div className={styles.content} ref={tooltipContentRef}>
          {children}
        </div>
      </div>
      <div className={styles.separator} />
    </div>
  );
};

export default Tooltip;
