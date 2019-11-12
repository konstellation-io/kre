import React from 'react';
import { formatDate } from '../../../../utils/format';

import CalendarIcon from '@material-ui/icons/Today';
import TimeIcon from '@material-ui/icons/AccessTime';

import cx from 'classnames';
import styles from './SidebarTitle.module.scss';


type DateInfoProps = {
  label: string,
  Icon: any,
  date?: string,
};
function DateInfo({label, Icon, date}: DateInfoProps) {
  return (
    <>
      <div className={ styles.dateTitle }>
        <Icon style={{ fontSize: '1.1em'}} />
        <div>{label}</div>
      </div>
      <div className={ styles.dateValue }>{date}</div>
    </>
  );
}


type Props = {
  title: string,
  status: string,
  version?: string,
  created: string,
  activated: string
};

function SidebarTitle({
  title,
  status,
  version,
  created,
  activated
}:Props) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.version}>
        <div className={cx(styles.versionStatus, styles[status])}/>
        <p>{`VERSION ${version}`}</p>
      </div>
      <div className={styles.dates}>
        <DateInfo label={'CREATED'} date={formatDate(new Date(created))} Icon={CalendarIcon} />
        <DateInfo label={'ACTIVATED'} date={formatDate(new Date(activated))} Icon={TimeIcon} />
      </div>
    </div>
  );
}

export default SidebarTitle;
