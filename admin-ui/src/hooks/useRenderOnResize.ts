import { useState, useEffect } from 'react';

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

type Params = {
  container: any;
};

export default function useRenderOnResize({ container }: Params) {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: container.current.clientWidth,
        height: container.current.clientHeight
      });
    }
    const handleSizeDebounced: any = debounce(handleResize, 300);

    handleResize();
    window.addEventListener('resize', handleSizeDebounced);

    return () => {
      window.removeEventListener('resize', handleSizeDebounced);
    };
  }, [container]);

  return dimensions;
}
