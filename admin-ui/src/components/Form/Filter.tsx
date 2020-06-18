import React from 'react';
import Chip from '../Chip/Chip';

type Props = {
  filter: string;
  value: string;
  removeFilter: Function;
  getLabelAndTitle: (
    filter: string,
    value: any
  ) => { label: string; title: string };
};
export function Filter({
  filter,
  value,
  removeFilter,
  getLabelAndTitle
}: Props) {
  function onClose() {
    removeFilter(filter, value);
  }

  const { label, title } = getLabelAndTitle(filter, value);
  return <Chip label={label} title={title} onClose={onClose} />;
}

export default Filter;
