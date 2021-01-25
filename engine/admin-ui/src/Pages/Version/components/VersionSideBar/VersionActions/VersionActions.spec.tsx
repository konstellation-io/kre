import { Button, ModalContainer, ModalLayoutJustify } from 'kwc';
import { runtime, version } from 'Mocks/version';

import React from 'react';
import VersionActions from './VersionActions';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { clone } from 'lodash';
import { label } from 'Utils/testUtilsEnzyme';
import { shallow } from 'enzyme';

jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [jest.fn(), { loading: false }])
}));

describe('VersionActions', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <VersionActions runtime={runtime} version={version} versions={[]} />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('has right components', async () => {
    expect(wrapper.exists('.wrapper')).toBeTruthy();
    expect(wrapper.find(Button).length).toBe(2);
  });

  it('show right buttons when version is STOPPED', async () => {
    const versionStopped = clone(version);
    versionStopped.status = VersionStatus.STOPPED;

    wrapper.setProps({ version: versionStopped });

    expect(wrapper.find(Button).length).toBe(2);
    expect(wrapper.find(Button).exists({ label: 'START' })).toBeTruthy();
    expect(wrapper.find(Button).exists({ label: 'PUBLISH' })).toBeTruthy();
    expect(
      wrapper
        .find(Button)
        .find({ label: 'PUBLISH' })
        .prop('disabled')
    ).toBeTruthy();
  });

  it('show START button disabled when version is STOPPED and not configured', async () => {
    const versionStopped = clone(version);
    versionStopped.status = VersionStatus.STOPPED;
    versionStopped.configurationCompleted = false;

    wrapper.setProps({ version: versionStopped });

    expect(wrapper.find(Button).exists({ label: 'START' })).toBeTruthy();
    expect(
      wrapper
        .find(Button)
        .find({ label: 'START' })
        .prop('disabled')
    ).toBeTruthy();
  });

  it('show right buttons when version is PUBLISHED', async () => {
    const versionPublished = clone(version);
    versionPublished.status = VersionStatus.PUBLISHED;

    wrapper.setProps({ version: versionPublished });

    expect(wrapper.find(Button).length).toBe(2);
    expect(wrapper.find(Button).exists({ label: 'STOP' })).toBeTruthy();
    expect(
      wrapper
        .find(Button)
        .find({ label: 'STOP' })
        .prop('disabled')
    ).toBeTruthy();
    expect(wrapper.find(Button).exists({ label: 'UNPUBLISH' })).toBeTruthy();
  });

  it('show right buttons when version is STARTING', async () => {
    const versionStarting = clone(version);
    versionStarting.status = VersionStatus.STARTING;

    wrapper.setProps({ version: versionStarting });

    expect(wrapper.find(Button).length).toBe(2);
  });

  it('show right buttons when version is STARTED', async () => {
    expect(wrapper.find(Button).length).toBe(2);
    expect(wrapper.find(Button).exists({ label: 'STOP' })).toBeTruthy();
    expect(wrapper.find(Button).exists({ label: 'PUBLISH' })).toBeTruthy();
  });

  it('shows confirmation modal when clicking PUBLISH button', async () => {
    wrapper
      .find(Button)
      .find(label('PUBLISH'))
      .simulate('click');

    expect(wrapper.exists(ModalLayoutJustify)).toBeTruthy();
  });

  it('hides confirmation modal on close', async () => {
    wrapper
      .find(Button)
      .find(label('PUBLISH'))
      .simulate('click');

    wrapper
      .find(ModalContainer)
      .dive()
      .find(label('CANCEL'))
      .simulate('click');

    expect(wrapper.exists(ModalContainer)).toBeFalsy();
  });
});
