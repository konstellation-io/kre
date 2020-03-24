import React, { ReactElement, useEffect } from 'react';
import { get } from 'lodash';
import styles from './AdminListForm.module.scss';
import ItemList from '../../../../components/ItemList/ItemList';
import FormField from '../FormField/FormField';
import { useForm } from 'react-hook-form';

type OnValidateType = (...args: any) => string | boolean;

type AdminListProps = {
  onSubmit: Function;
  onRemoveItem: Function;
  itemName: string;
  itemList: string[];
  error?: string;
  isLoading?: boolean;
  onValidate?: OnValidateType;
  icon?: ReactElement;
};

function AdminListForm({
  onSubmit,
  onRemoveItem,
  itemName,
  itemList,
  error,
  isLoading = false,
  onValidate = () => true,
  icon = <></>
}: AdminListProps) {
  const {
    handleSubmit,
    setValue,
    register,
    errors,
    watch,
    clearError
  } = useForm();

  useEffect(() => {
    register('item', {
      validate: value => onValidate(value, itemList)
    });
    setValue('item', '');
  }, [register, setValue, itemList, onValidate]);

  function handleOnSubmit(formData: any) {
    onSubmit(formData);
    setValue('item', '');
  }

  function handleRemoveItem(args: any) {
    setValue('item', '');
    clearError('item');
    onRemoveItem(args);
  }

  return (
    <div className={styles.container}>
      <FormField
        fieldName={itemName}
        error={get(errors.item, 'message')}
        onChange={(value: string) => setValue('item', value)}
        onSubmit={handleSubmit(handleOnSubmit)}
        value={watch('item', '')}
        icon={icon}
      />
      <div className={styles.items}>
        <ItemList
          onRemoveItem={handleRemoveItem}
          error={error}
          loading={isLoading}
          data={itemList}
        />
      </div>
    </div>
  );
}

export default AdminListForm;
