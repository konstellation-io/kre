import Button, { BUTTON_ALIGN } from '../Button/Button';
import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react';

import ContextualMenuModal from './ContextualMenuModal';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import cx from 'classnames';
import styles from './ContextMenu.module.scss';
import useClickOutside from 'Hooks/useClickOutside';

const MENU_OFFSET = 7;

export interface MenuCallToAction {
  Icon?: FunctionComponent<SvgIconProps>;
  disabled?: boolean;
  text: string;
  callToAction?: Function;
  separator?: boolean;
}

type ContextMenuPosition = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
};

interface ContextMenu {
  isVisible: boolean;
  position: ContextMenuPosition;
}

type Props = {
  children: ReactElement;
  actions: MenuCallToAction[];
  contextObject?: number | string;
  openOnLeftClick?: boolean;
};

function ContextMenu({
  children,
  actions,
  contextObject,
  openOnLeftClick = false
}: Props) {
  const childElement = useRef<HTMLElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [stateContextMenu, setStateContextMenu] = useState<ContextMenu>({
    isVisible: false,
    position: {}
  });
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: contextMenuRef,
    action: hideContextMenu,
    mousedown: true
  });

  function onOpenMenu(event: any) {
    event.preventDefault();
    event.stopPropagation();

    const newPosition: ContextMenuPosition = {};
    const windowWidth = window.innerWidth;
    let { clientX, clientY } = event;

    if (clientX + 150 > windowWidth) {
      newPosition.right = `${MENU_OFFSET}px`;
    } else {
      newPosition.left = `${clientX + MENU_OFFSET}px`;
    }

    newPosition.top = `${clientY + MENU_OFFSET}px`;
    setStateContextMenu({
      isVisible: true,
      position: newPosition
    });

    addClickOutsideEvents();
  }
  const event = openOnLeftClick ? 'click' : 'contextmenu';
  function removeListener() {
    if (childElement && childElement.current) {
      childElement.current.removeEventListener(event, onOpenMenu);
    }
  }
  useEffect(() => {
    if (childElement && childElement.current) {
      childElement.current.addEventListener(event, onOpenMenu);
      return removeListener;
    }
    // This should only be done on mount/unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function hideContextMenu(): void {
    setStateContextMenu({
      isVisible: false,
      position: {}
    });

    removeClickOutsideEvents();
  }

  function handleMenuItemClick(action: MenuCallToAction): void {
    hideContextMenu();
    if (action.callToAction) action.callToAction(action, contextObject);
  }

  return (
    <>
      {stateContextMenu.isVisible && (
        <ContextualMenuModal>
          <div
            className={styles.contextMenuContainer}
            ref={contextMenuRef}
            style={{ ...stateContextMenu.position }}
            onClick={e => e.stopPropagation()}
            onContextMenu={e => e.preventDefault()}
          >
            <ul className={styles.contextMenuList}>
              {actions.map((action, index) => (
                <li
                  key={`${action.text}-${index}`}
                  className={cx({ [styles.separator]: action.separator })}
                >
                  <Button
                    label={action.text}
                    Icon={action.Icon}
                    onClick={() => handleMenuItemClick(action)}
                    align={BUTTON_ALIGN.LEFT}
                    disabled={action.separator || action.disabled}
                  />
                </li>
              ))}
            </ul>
          </div>
        </ContextualMenuModal>
      )}
      {React.cloneElement(children, { ref: childElement })}
    </>
  );
}

export default ContextMenu;
