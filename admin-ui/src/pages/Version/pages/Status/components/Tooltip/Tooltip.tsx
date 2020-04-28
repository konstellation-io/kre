import React, { RefObject, FunctionComponent, MouseEvent } from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import styles from './Tooltip.module.scss';
import cx from 'classnames';
import '../../icons/icons.scss';
import { NodeStatus } from '../../../../../../graphql/types/globalTypes';

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
      ref={tooltipRef}
    >
      <div
        className={styles.container}
        onMouseEnter={onTooltipEnter}
        onMouseLeave={onTooltipLeave}
        ref={tooltipRef}
      >
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
