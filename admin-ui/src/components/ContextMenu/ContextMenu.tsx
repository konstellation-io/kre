import React, { ReactElement, useEffect, useRef, useState } from 'react';
import styles from './ContextMenu.module.scss';
import useClickOutsideListener from '../../hooks/useClickOutsideListener';

type Props = {
  children: ReactElement;
  actions: MenuCallToAction[];
  contextObject: any;
};

export interface MenuCallToAction {
  iconComponent?: JSX.Element;
  text: string;
  callToAction: Function;
}

interface ContextMenu {
  isVisible: boolean;
  x: number;
  y: number;
}

function ContextMenu({ children, actions, contextObject }: Props) {
  const childElement = useRef<HTMLElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [stateContextMenu, setStateContextMenu] = useState<ContextMenu>({
    isVisible: false,
    x: 0,
    y: 0
  });
  function onRightClick(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const clickX = event.clientX;
    const clickY = event.clientY;
    setStateContextMenu({
      isVisible: true,
      x: clickX,
      y: clickY
    });
  }
  function removeListener() {
    if (childElement && childElement.current) {
      childElement.current.removeEventListener('contextmenu', onRightClick);
    }
  }
  useEffect(() => {
    if (childElement && childElement.current) {
      childElement.current.addEventListener('contextmenu', onRightClick);
      return removeListener;
    }
  }, []);

  useClickOutsideListener({
    ref: contextMenuRef,
    onClickOutside: hideContextMenu
  });

  function hideContextMenu(): void {
    setStateContextMenu({
      isVisible: false,
      x: 0,
      y: 0
    });
  }

  function handleMenuItemClick(action: MenuCallToAction): void {
    hideContextMenu();
    action.callToAction(action, contextObject);
  }

  return (
    <>
      {stateContextMenu.isVisible && (
        <div
          className={styles.contextMenuContainer}
          ref={contextMenuRef}
          style={{
            top: `${stateContextMenu.y + 7}px`,
            left: `${stateContextMenu.x + 7}px`
          }}
        >
          <ul className={styles.contextMenuList}>
            {actions.map((action, index) => (
              <li
                key={`${action.text}-${index}`}
                onClick={() => handleMenuItemClick(action)}
              >
                {action.iconComponent}
                <span className={styles.menuText}>{action.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {React.cloneElement(children, { ref: childElement })}
    </>
  );
}

export default ContextMenu;
