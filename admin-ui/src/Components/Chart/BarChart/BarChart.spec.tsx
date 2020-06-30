import React from 'react';
import { shallow } from 'enzyme/build';
import BarChart from './BarChart';

describe('BarChart component', () => {
  let wrapper;

  const dataMock = [
    { x: 'foo', y: 5 },
    { x: 'bar', y: 10 }
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
      <BarChart
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
