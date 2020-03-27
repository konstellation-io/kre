import React from 'react';

import Box from '../../components/Box/Box';
import Title from '../../components/Box/Title';
import InfoNumber, { Sizes } from '../../components/Box/InfoNumber';
import {
  GetMetrics_metrics_values,
  GetMetrics_metrics_values_accuracy
} from '../../../../../../graphql/queries/types/GetMetrics';

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

function Section1({
  total,
  micro,
  macro,
  weighted
}: GetMetrics_metrics_values_accuracy) {
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
  data: GetMetrics_metrics_values;
};
function GeneralInfo({ data }: Props) {
  return (
    <Box>
      <Title text="Accuracy" />
      <div className={styles.sections}>
        <Section1 {...data.accuracy} />
        <Section2 value={`${data.missing}%`} label="Missing values" />
        <Section2 value={`${data.newLabels}%`} label="New labels" />
      </div>
    </Box>
  );
}

export default GeneralInfo;
