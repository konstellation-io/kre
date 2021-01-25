import { Button } from 'kwc';
import DeleteIcon from '@material-ui/icons/Delete';
import { GetApiTokens_me_apiTokens } from 'Graphql/queries/types/GetApiTokens';
import KeyIcon from '@material-ui/icons/VpnKey';
import React from 'react';
import { formatDate } from 'Utils/format';
import styles from './ApiTokensInfo.module.scss';

type TokenDateProps = {
  label: string;
  value?: string | null;
  noValueText?: string;
};
function TokenDate({ label, value, noValueText }: TokenDateProps) {
  if (!value) return <p>{noValueText}</p>;

  return (
    <div className={styles.tokenDate}>
      <p className={styles.label}>{`${label}: `}</p>
      <p className={styles.value}>{formatDate(new Date(value), true)}</p>
    </div>
  );
}

type Props = {
  token: GetApiTokens_me_apiTokens;
  setTokenToRemove: Function;
};
function ApiTokenInfo({ token, setTokenToRemove }: Props) {
  return (
    <div className={styles.tokenRow}>
      <div className={styles.info}>
        <div className={styles.icon}>
          <KeyIcon className="icon-regular" />
        </div>
        <div className={styles.infoValues}>
          <p className={styles.name}>{token.name}</p>
          <div className={styles.dates}>
            <TokenDate label="Generated on" value={token.creationDate} />
            <TokenDate
              label="Last used"
              value={token.lastActivity}
              noValueText="This token has not already been used."
            />
          </div>
        </div>
      </div>
      <Button
        label="DELETE"
        Icon={DeleteIcon}
        onClick={() => setTokenToRemove(token.id)}
      />
    </div>
  );
}

export default ApiTokenInfo;
