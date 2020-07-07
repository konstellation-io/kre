import React from 'react';
import { shallow } from 'enzyme/build';
import ConfusionMatrix from './ConfusionMatrix';

describe('ConfusionMatrix component', () => {
  let wrapper;

  const dataMock = [
    { x: 'foo', y: 'foofoo', value: 5 },
    { x: 'bar', y: 'barbar', value: 6 }
  ];
  const heightMock = 100;
  const marginMock = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  };
  const widthMock = 100;
  beforeEach(() => {
    jest.resetAllMocks();
    wrapper = shallow(
      <ConfusionMatrix
        data={dataMock}
        height={heightMock}
        margin={marginMock}
        width={widthMock}
      />
    );
  });

  it('should render without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
