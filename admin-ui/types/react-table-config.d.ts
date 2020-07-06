// This approach follows the one specified in react-table documentation for v7
// https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-table#example-type-file

import {
  UseRowSelectHooks,
  UseRowSelectInstanceProps,
  UseRowSelectOptions,
  UseRowSelectRowProps,
  UseRowSelectState,
  UseSortByColumnOptions,
  UseSortByColumnProps,
  UseSortByHooks,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState
} from 'react-table';

declare module 'react-table' {
  export interface TableOptions<D extends object>
    extends UseRowSelectOptions<D>,
      UseSortByOptions<D> {}

  export interface Hooks<D extends object = {}>
    extends UseRowSelectHooks<D>,
      UseSortByHooks<D> {}

  export interface TableInstance<D extends object = {}>
    extends UseRowSelectInstanceProps<D>,
      UseSortByInstanceProps<D> {}

  export interface TableState<D extends object = {}>
    extends UseRowSelectState<D>,
      UseSortByState<D> {}

  export interface ColumnInterface<D extends object = {}>
    extends UseSortByColumnOptions<D> {}

  export interface ColumnInstance<D extends object = {}>
    extends UseSortByColumnProps<D> {}

  export interface Row<D extends object = {}> extends UseRowSelectRowProps<D> {}
}
