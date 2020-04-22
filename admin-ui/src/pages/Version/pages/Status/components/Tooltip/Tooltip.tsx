import React, { RefObject } from 'react';
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
  onTooltipEnter: Function;
  onTooltipLeave: Function;
  tooltipHeader: TooltipHeader;
  tooltipContent: JSX.Element;
  tooltipStatus: NodeStatus;
};

function Tooltip({
  tooltipRef,
  tooltipHeaderRef,
  tooltipContentRef,
  tooltipVisible,
  onTooltipEnter,
  onTooltipLeave,
  tooltipHeader,
  tooltipContent,
  tooltipStatus
}: Props) {
  return (
    <div
      className={cx(styles.wrapper, styles[tooltipStatus], {
        [styles.show]: tooltipVisible
      })}
      ref={tooltipRef}
    >
      <div
        className={styles.container}
        onMouseEnter={() => onTooltipEnter()}
        onMouseLeave={() => onTooltipLeave()}
        ref={tooltipRef}
      >
        <div className={styles.header} ref={tooltipHeaderRef}>
          <SvgIcon className={cx('icon-regular', tooltipStatus)}>
            {tooltipHeader.Icon}
          </SvgIcon>
          <div className={styles.title}>{tooltipHeader.title}</div>
        </div>
        <div className={styles.content} ref={tooltipContentRef}>
          {tooltipContent}
        </div>
      </div>
      <div className={styles.separator} />
    </div>
  );
}

export default Tooltip;
