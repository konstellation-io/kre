import { MutableRefObject, useEffect, useRef, useState } from 'react';

type Dimensions = {
  width: number;
  height: number;
};
type Params = {
  container: MutableRefObject<HTMLDivElement | null>;
};

export default function useRenderOnResize({ container }: Params) {
  // Some components make an update on it content after rendering it (using refs) causing
  // the component to have zero height|width on its first render and the desired one after
  // it. With this flag I remove debouncing after the first render.
  const isFirstRender = useRef(true);
  const timer = useRef<number>();
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0
  });
  const observer = useRef(
    // @ts-ignore Wait for this issue to be solved https://github.com/microsoft/TypeScript/issues/37861
    new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const { width, height } = entries[0].contentRect;
      let rerender: Function = () => handleResize({ width, height });

      if (!isFirstRender.current) {
        rerender = debounce(rerender, 20);
      } else {
        isFirstRender.current = false;
      }
      rerender();
    })
  );

  useEffect(() => {
    const target = container.current;
    if (target) {
      const observedNode = observer.current;
      const [width, height] = [target.clientWidth, target.clientHeight];

      handleResize({ width, height });

      observedNode.observe(target);
      return () => {
        observedNode.unobserve(target);
      };
    }
  }, [container]);

  function debounce(fn: Function, ms: number): Function {
    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
      timer.current = window.setTimeout(() => {
        timer.current = 0;
        fn.apply(this, arguments);
      }, ms);
    };
  }

  function handleResize({ width, height }: Dimensions) {
    setDimensions({
      width: width,
      height: height
    });
  }

  return dimensions;
}
