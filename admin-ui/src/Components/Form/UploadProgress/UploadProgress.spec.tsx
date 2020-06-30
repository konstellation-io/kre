import React from 'react';
import { shallow } from 'enzyme';
import UploadProgress from './UploadProgress';

describe('UploadProgress component', () => {
  let wrapper;

  const fileNameMock = 'foo';
  const progressMock = 50;
  beforeEach(() => {
    jest.resetAllMocks();
    wrapper = shallow(
      <UploadProgress fileName={fileNameMock} progress={progressMock} />
    );
  });

  it('should render without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should show fileUploaded if progress is 100', () => {
    wrapper.setProps({ progress: 100 });
    expect(wrapper).toMatchSnapshot();
  });
});
