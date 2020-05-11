import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-canvas-mock';

configure({ adapter: new Adapter() });

jest.mock('./config', () => ({
  envVariables: jest.fn().mockReturnValue({
    API_BASE_URL: 'some value'
  })
}));

jest.mock('./hooks/useUserAccess', () => () => 'ADMINISTRATOR');

class ResizeObserver {
  observe() {}
  unobserve() {}
}

window.ResizeObserver = ResizeObserver;
