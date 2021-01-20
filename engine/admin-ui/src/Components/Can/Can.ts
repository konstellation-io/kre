import { checkPermission } from 'rbac-rules';
import useUserAccess from 'Hooks/useUserAccess';

type Props = {
  children: JSX.Element;
  perform: string;
  data?: Object;
};

function Can({ children, perform, data = {} }: Props) {
  const { accessLevel } = useUserAccess();

  return checkPermission(accessLevel, perform, data) ? children : null;
}

export default Can;
