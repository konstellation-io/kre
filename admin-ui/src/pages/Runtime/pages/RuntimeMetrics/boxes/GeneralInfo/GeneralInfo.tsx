import React from 'react';

import Box from '../../components/Box/Box';
import Title from '../../components/Box/Title';
import InfoNumber, { Sizes } from '../../components/Box/InfoNumber';

import styles from './GeneralInfo.module.scss';

type Section1InfoRowProps = {
  value: number;
  label: string;
};
function Section1InfoRow({ value, label }: Section1InfoRowProps) {
  return (
    <div className={styles.infoRow}>
      <InfoNumber text={`${value}%`} />
      <p>{label}</p>
    </div>
  );
}

type Section1Props = {
  total: number;
  micro: number;
  macro: number;
  weighted: number;
};
function Section1({ total, micro, macro, weighted }: Section1Props) {
  return (
    <div className={styles.section}>
      <div className={styles.accuracy}>
        <div className={styles.totalAccuracy}>
          <span>{`${total}%`}</span>
        </div>
        <div className={styles.infoRows}>
          <Section1InfoRow value={micro} label="micro" />
          <Section1InfoRow value={macro} label="macro" />
          <Section1InfoRow value={weighted} label="weighted" />
        </div>
      </div>
    </div>
  );
}

type Section2Props = {
  value: string;
  label: string;
};
function Section2({ value, label }: Section2Props) {
  return (
    <div className={styles.section}>
      <InfoNumber text={value} size={Sizes.BIG} />
      <p>{label}</p>
    </div>
  );
}

type Props = {
  data: {
    accuracy: {
      total: number;
      micro: number;
      macro: number;
      weighted: number;
    };
    null: number;
    labels: number;
    stdev: number;
  };
};
function GeneralInfo({ data }: Props) {
  return (
    <Box>
      <Title text="Accuracy" />
      <div className={styles.sections}>
        <Section1 {...data.accuracy} />
        <Section2 value={`${data.null}%`} label="Null" />
        <Section2 value={`${data.labels}%`} label="New labels" />
        <Section2 value={data.stdev.toString()} label="Standard deviation" />
      </div>
    </Box>
  );
}

export default GeneralInfo;
