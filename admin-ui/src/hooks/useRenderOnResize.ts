import { useState, useEffect, useRef } from 'react';

function debounce(fn: Function, ms: number): Function {
  let timer: any;

  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      // @ts-ignore
      fn.apply(this, arguments);
    }, ms);
  };
}

type Dimensions = {
  width: number;
  height: number;
};
type Params = {
  container: any;
};

export default function useRenderOnResize({ container }: Params) {
  // Some components make an update on it content after rendering it (using refs) causing
  // the component to have zero height|width on its first render and the desired one after
  // it. With this flag I remove debouncing after the first render.
  const isFirstRender = useRef(true);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0
  });
  // @ts-ignore
  const observer = useRef(
    new ResizeObserver((entries: any) => {
      const { width, height } = entries[0].contentRect;
      let rerender: Function = () => handleResize({ width, height });

      if (!isFirstRender.current) {
        rerender = debounce(rerender, 300);
      } else {
        isFirstRender.current = false;
      }
      rerender();
    })
  );

  useEffect(() => {
    const target = container.current;
    const [width, height] = [target.clientWidth, target.clientHeight];

    handleResize({ width, height });

    observer.current.observe(target);
    return () => {
      observer.current.unobserve(target);
    };
  }, [container]);

  function handleResize({ width, height }: Dimensions) {
    setDimensions({
      width: width,
      height: height
    });
  }

  return dimensions;
}
