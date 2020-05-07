import useUserAccess from '../../hooks/useUserAccess';
import { AccessLevel } from '../../graphql/types/globalTypes';

type Props = {
  children: JSX.Element;
  access?: boolean;
};

function Can({ children, access = false }: Props) {
  const { requiredLevel } = useUserAccess();

  let content = null;

  if (access && requiredLevel(AccessLevel.MANAGER, AccessLevel.ADMINISTRATOR)) {
    content = children;
  }

  return content;
}

export default Can;
