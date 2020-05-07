import useUserAccess from '../../hooks/useUserAccess';
import { AccessLevel } from '../../graphql/types/globalTypes';

type Props = {
  children: JSX.Element;
  requiresManager: boolean;
};

function Can({ children, requiresManager = false }: Props) {
  const { requiredLevel } = useUserAccess();

  let content = null;

  if (
    requiresManager &&
    requiredLevel(AccessLevel.MANAGER, AccessLevel.ADMINISTRATOR)
  ) {
    content = children;
  }

  return content;
}

export default Can;
