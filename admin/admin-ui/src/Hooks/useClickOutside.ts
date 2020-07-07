import { RefObject, useCallback } from 'react';

type Params = {
  componentRef: RefObject<HTMLElement> | null;
  action: () => void;
  mousedown?: boolean;
};
export default function useClickOutside({
  componentRef = null,
  action = () => {},
  mousedown = false
}: Params) {
  const handleClickOutside = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;

      // Has the user clicked outside the component?
      if (
        componentRef === null ||
        (document.contains(target) && !componentRef.current?.contains(target))
      ) {
        action();
      }
    },
    // 'action' is not added so the reference to this function does not
    // depends on 'action' parameter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [componentRef]
  );

  const events = mousedown ? ['mousedown'] : ['contextmenu', 'click'];

  function addClickOutsideEvents() {
    events.forEach(event =>
      document.addEventListener(event, handleClickOutside)
    );
  }

  function removeClickOutsideEvents() {
    events.forEach(event =>
      document.removeEventListener(event, handleClickOutside)
    );
  }

  return { addClickOutsideEvents, removeClickOutsideEvents };
}
