import { library, IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faChartBar,
  faUser,
  faCodeBranch,
  faSlidersH,
  faSignOutAlt,
  faCookie,
  faShieldAlt,
  faTrash,
  faEnvelope,
  faClock,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import {
  faSquare
} from '@fortawesome/free-regular-svg-icons';

library.add(
  faChartBar,
  faUser,
  faCodeBranch,
  faSlidersH,
  faSignOutAlt,
  faCookie,
  faShieldAlt,
  faTrash,
  faEnvelope,
  faClock,
  faArrowLeft,
  faSquare,
);

const solidIcons:any = {
  CHART: 'chart-bar',
  USER: 'user',
  BRANCH: 'code-branch',
  SETTINGS: 'sliders-h',
  LOGOUT: 'sign-out-alt',
  COOKIE: 'cookie',
  SECURITY: 'shield-alt',
  DELETE: 'trash',
  MAIL: 'envelope',
  CLOCK: 'clock',
  LEFT: 'arrow-left',
};
const regularIcons:any = {
  SQUARE: 'square',
};

Object.keys(solidIcons).forEach((key:string) => {
  solidIcons[key] = {prefix: 'fas', iconName: solidIcons[key]} as IconProp;
});
Object.keys(regularIcons).forEach((key:string) => {
  regularIcons[key] = {prefix: 'far', iconName: regularIcons[key]} as IconProp;
});

export const ICON = {
  ...solidIcons,
  ...regularIcons,
};
