import React from 'react';

import SpinnerCircular from '../LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import RemoveIcon from '@material-ui/icons/Delete';

import styles from './DomainList.module.scss';
import { ApolloError } from 'apollo-client';

type Props = {
  onRemoveDomain: Function;
  data: string[];
  loading?: boolean;
  error?: ApolloError;
};
function DomainList({
  onRemoveDomain = function(domain: string) {},
  data,
  loading,
  error
}: Props) {
  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const domains = data.map((domain: string, idx: number) => (
    <div className={styles.row} key={`domainListElement${idx}`}>
      <p className={styles.domainPosition}>{idx + 1}</p>
      <p className={styles.domainName} data-testid={`domainListName${idx}`}>
        {domain}
      </p>
      <div
        className={styles.removeButton}
        onClick={() => onRemoveDomain(domain)}
        data-testid={`domainListRemove${idx}`}
      >
        <RemoveIcon className="icon-regular" />
      </div>
    </div>
  ));

  return <>{domains}</>;
}

export default DomainList;
