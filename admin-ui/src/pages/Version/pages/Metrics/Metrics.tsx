import {
  GetMetrics,
  GetMetricsVariables
} from '../../../../graphql/queries/types/GetMetrics';
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from '../../../../graphql/queries/types/GetVersionConfStatus';
import React, { useCallback, useEffect, useState } from 'react';
import moment, { Moment } from 'moment';

import Charts from './components/Charts/Charts';
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import Message from '../../../../components/Message/Message';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import { VersionRouteParams } from '../../../../constants/routes';
import { loader } from 'graphql.macro';
import styles from './Metrics.module.scss';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';

const GetMetricsQuery = loader(
  '../../../../graphql/queries/getMetrics.graphql'
);

type FormData = {
  startDate: Moment;
  endDate: Moment;
};

const DEFAULT_DATES: FormData = {
  startDate: moment()
    .subtract(30, 'days')
    .startOf('day'),
  endDate: moment().endOf('day')
};

type Props = {
  runtime?: GetVersionConfStatus_runtime;
  version?: GetVersionConfStatus_versions;
};

function Metrics({ runtime, version }: Props) {
  const [viewAllData, setViewAllData] = useState<boolean>(false);

  const { versionId, runtimeId } = useParams<VersionRouteParams>();
  const { data, loading, error, refetch } = useQuery<
    GetMetrics,
    GetMetricsVariables
  >(GetMetricsQuery, {
    variables: {
      versionId,
      runtimeId,
      startDate: DEFAULT_DATES.startDate.toISOString(),
      endDate: DEFAULT_DATES.endDate.toISOString()
    }
  });

  const { register, watch, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      startDate: DEFAULT_DATES.startDate,
      endDate: DEFAULT_DATES.endDate
    }
  });

  const [expanded, setExpanded] = useState<string>('');
  function toggleExpanded(nodeId: string): void {
    setExpanded(expanded ? '' : nodeId);
  }

  useEffect(() => {
    register({ name: 'startDate' });
    register({ name: 'endDate' });
  }, [register]);

  const submit = useCallback(() => {
    handleSubmit(({ startDate, endDate }: FormData) => {
      refetch({
        runtimeId,
        versionId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    })();
  }, [handleSubmit, refetch, runtimeId, versionId]);

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error || !data) return <ErrorMessage />;
    if (data && data.metrics === null)
      return <Message text="There is no data for the selected dates" />;

    return (
      <Charts
        data={data}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        viewAllData={viewAllData}
      />
    );
  }

  return (
    <div className={styles.container}>
      <DashboardHeader
        runtimeName={runtime && runtime.name}
        versionName={version && version.name}
        value={watch}
        onChange={setValue}
        submit={submit}
        viewAllData={viewAllData}
        setViewAllData={setViewAllData}
      />
      {getContent()}
    </div>
  );
}

export default Metrics;
