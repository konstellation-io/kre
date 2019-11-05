import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ICON} from '../../icons';

import styles from './DomainList.module.scss';


type Props = {
  onRemoveDomain: Function
  data: string[]
};
function DomainList({
  onRemoveDomain = function(domain:string) {},
  data
}: Props) {
  const domains = data.map((domain:any, idx:number) => (
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
