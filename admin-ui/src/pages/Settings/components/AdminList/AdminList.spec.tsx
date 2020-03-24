import React from 'react';
import { shallow } from 'enzyme';
import AdminListForm from './AdminListForm';

describe('AdminListForm component', () => {
  let wrapper: any;

  const onSubmitMock = jest.fn();
  const itemListMock = ['foo', 'bar', 'baz', 'qux'];
  const onRemoveItemMock = jest.fn();
  const itemNameMock = 'FOO';
  const errorMock = 'error';
  const onValidateMock = jest.fn();
  const isLoadingMock = false;

  beforeEach(() => {
    jest.resetAllMocks();
    wrapper = shallow(
      <AdminListForm
        onSubmit={onSubmitMock}
        itemList={itemListMock}
        onRemoveItem={onRemoveItemMock}
        itemName={itemNameMock}
        error={errorMock}
        onValidate={onValidateMock}
        isLoading={isLoadingMock}
      />
    );
  });

  it('should render without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
