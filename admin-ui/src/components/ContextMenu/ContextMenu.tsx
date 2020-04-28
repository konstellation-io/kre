import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react';
import styles from './ContextMenu.module.scss';
import useClickOutsideListener from '../../hooks/useClickOutsideListener';
import Button, { BUTTON_ALIGN } from '../Button/Button';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

type Props = {
  children: ReactElement;
  actions: MenuCallToAction[];
  contextObject: number;
};

export interface MenuCallToAction {
  Icon?: FunctionComponent<SvgIconProps>;
  text: string;
  callToAction: Function;
}

interface ContextMenu {
  isVisible: boolean;
  x: number;
  y: number;
}

function ContextMenu({ children, actions, contextObject }: Props) {
  const windowWidth = window.innerWidth;
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
    let clickX = event.clientX;
    const clickY = event.clientY;
    if (clickX + 150 > windowWidth) {
      clickX = clickX - 130;
    }
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
              <li key={`${action.text}-${index}`}>
                <Button
                  label={action.text}
                  Icon={action.Icon}
                  onClick={() => handleMenuItemClick(action)}
                  align={BUTTON_ALIGN.LEFT}
                />
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
