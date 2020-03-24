import React from 'react';
import { shallow } from 'enzyme';
import FormField from './FormField';

describe('FormField component', () => {
  let wrapper: any;

  const errorMock = 'foo';
  const onChangeMock = jest.fn();
  const onSubmitMock = jest.fn();
  const fieldNameMock = 'bar';
  const valueMock = 'baz';

  beforeEach(() => {
    jest.resetAllMocks();
    wrapper = shallow(
      <FormField
        icon={<></>}
        error={errorMock}
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        fieldName={fieldNameMock}
        value={valueMock}
      />
    );
  });

  it('should render without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
