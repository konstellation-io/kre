import React from 'react';
import Spinner from '../Spinner/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ICON} from '../../icons';
import styles from './DomainList.module.scss';

import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

export const GET_DOMAINS = gql`
  query GetDomains {
    settings {
      authAllowedDomains
    }
  }
`;

function DomainList({
  onRemoveDomain= function(domain:string) {}
} = {}) {
  const { data, loading, error } = useQuery(GET_DOMAINS);
  if (loading) return <Spinner />;
  if (error) return <p>ERROR</p>;

  const domains = data.settings.authAllowedDomains.map((domain:any, idx:number) => (
    <div className={styles.row} key={`domainListElement${idx}`}>
      <p className={styles.domainPosition}>{idx + 1}</p>
      <p className={styles.domainName} data-testid={`domainListName${idx}`}>{domain}</p>
      <div
        className={styles.removeButton}
        onClick={() => onRemoveDomain(domain)}
        data-testid={`domainListRemove${idx}`}
      >
        <FontAwesomeIcon icon={ICON.DELETE} />
      </div>
    </div>
  ));

  return (
    <>
      {domains}
    </>
  );
}


export default DomainList;
