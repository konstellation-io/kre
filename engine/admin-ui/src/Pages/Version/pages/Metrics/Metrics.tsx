import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetMetrics,
  GetMetricsVariables
} from 'Graphql/queries/types/GetMetrics';
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';
import React, { useCallback, useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { registerMany, unregisterMany } from 'Utils/react-forms';

import Charts from './components/Charts/Charts';
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import Message from 'Components/Message/Message';
import { VersionRouteParams } from 'Constants/routes';
import { loader } from 'graphql.macro';
import styles from './Metrics.module.scss';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

const GetMetricsQuery = loader('Graphql/queries/getMetrics.graphql');

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

  const { versionName } = useParams<VersionRouteParams>();
  const { data, loading, error, refetch } = useQuery<
    GetMetrics,
    GetMetricsVariables
  >(GetMetricsQuery, {
    variables: {
      versionName,
      startDate: DEFAULT_DATES.startDate.toISOString(),
      endDate: DEFAULT_DATES.endDate.toISOString()
    }
  });

  const { register, unregister, watch, setValue, handleSubmit } = useForm<
    FormData
  >({
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
    const fields = ['startDate', 'endDate'];
    registerMany(register, fields);

    return () => unregisterMany(unregister, fields);
  }, [register, unregister]);

  const submit = useCallback(() => {
    handleSubmit(({ startDate, endDate }: FormData) => {
      refetch({
        versionName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    })();
  }, [handleSubmit, refetch, versionName]);

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
