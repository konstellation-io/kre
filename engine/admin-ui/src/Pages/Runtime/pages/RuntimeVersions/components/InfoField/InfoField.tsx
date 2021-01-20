import React, { FunctionComponent } from 'react';
import styles from './InfoField.module.scss';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

type Props = {
  field: string;
  value: string;
  Icon: FunctionComponent<SvgIconProps>;
};

function InfoField({ field, value, Icon }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.field}>{field}</div>
      <div className={styles.valueContainer}>
        <Icon className="icon-small" />
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
}

export default InfoField;
