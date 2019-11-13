import React from 'react';
import { mount } from 'enzyme';

type TestHookprops = {
  callback: Function;
};
const TestHook = ({ callback }: TestHookprops) => {
  callback();
  return null;
};

export const testHook = (callback: Function) => {
  mount(<TestHook callback={callback} />);
};
