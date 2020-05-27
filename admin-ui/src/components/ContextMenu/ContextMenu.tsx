import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react';
import styles from './ContextMenu.module.scss';
import useClickOutside from '../../hooks/useClickOutside';
import Button, { BUTTON_ALIGN } from '../Button/Button';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

export interface MenuCallToAction {
  Icon?: FunctionComponent<SvgIconProps>;
  disabled?: boolean;
  text: string;
  callToAction: Function;
}

interface ContextMenu {
  isVisible: boolean;
  x: number;
  y: number;
}

type Props = {
  children: ReactElement;
  actions: MenuCallToAction[];
  contextObject: number;
  openOnLeftClick?: boolean;
};

function ContextMenu({
  children,
  actions,
  contextObject,
  openOnLeftClick = false
}: Props) {
  const windowWidth = window.innerWidth;
  const childElement = useRef<HTMLElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [stateContextMenu, setStateContextMenu] = useState<ContextMenu>({
    isVisible: false,
    x: 0,
    y: 0
  });
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: contextMenuRef,
    action: hideContextMenu,
    mousedown: true
  });

  function onOpenMenu(event: any) {
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
      x: 0,
      y: 0
    });

    removeClickOutsideEvents();
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
          onClick={e => e.stopPropagation()}
          onContextMenu={e => e.preventDefault()}
        >
          <ul className={styles.contextMenuList}>
            {actions.map((action, index) => (
              <li key={`${action.text}-${index}`}>
                <Button
                  label={action.text}
                  Icon={action.Icon}
                  onClick={() => handleMenuItemClick(action)}
                  align={BUTTON_ALIGN.LEFT}
                  disabled={action.disabled}
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
