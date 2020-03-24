import React from 'react';

import SpinnerCircular from '../LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import RemoveIcon from '@material-ui/icons/Delete';

import styles from './ItemList.module.scss';

type Props = {
  onRemoveItem: Function;
  data: string[];
  loading?: boolean;
  error?: string;
};
function ItemList({
  onRemoveItem = function(item: string) {},
  data,
  loading,
  error
}: Props) {
  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const items = data.map((item: string, idx: number) => (
    <div className={styles.row} key={item}>
      <p className={styles.itemPosition}>{idx + 1}</p>
      <p className={styles.itemName} data-testid={`itemListName${idx}`}>
        {item}
      </p>
      <div
        className={styles.removeButton}
        onClick={() => onRemoveItem(item)}
        data-testid={`itemListRemove${idx}`}
      >
        <RemoveIcon className="icon-regular" />
      </div>
    </div>
  ));

  return <>{items}</>;
}

export default ItemList;
