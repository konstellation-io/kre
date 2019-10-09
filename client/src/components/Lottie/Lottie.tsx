import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';

function Lottie({
  options,
  segments,
  forceSegments,
  width,
  height,
  speed = 1,
  direction = 1,
  style,
}: any) {
  const { loop, autoplay, animationData } = options;

  let el = useRef<any>(null);
  let animRef = useRef<any>(null);

  useEffect(() => {
    if (!animRef.current) {
      const autoPlaySegments = !segments && autoplay !== false;

      if (el.current === null) {
        return;
      }

      const lottieOptions = {
        container: el.current,
        renderer: 'svg',
        loop: loop !== false,
        autoplay: autoPlaySegments ? false : autoplay,
        animationData,
        ...options,
      };

      let anim = lottie.loadAnimation(lottieOptions);
      anim.setSpeed(speed);
      anim.setDirection(direction);

      animRef.current = anim;
    }

    if (segments) {
      const shouldForce = !!forceSegments;
      animRef.current.playSegments(segments, shouldForce);
    } else {
      animRef.current.play();
    }
  });

  useEffect(() => {
    return () => {
      if (animRef.current) {
        animRef.current.destroy();
      }
    };
  }, []);

  const getSize = (initial: number | string) => {
    let size;

    if (typeof initial === 'number') {
      size = `${initial}px`;
    } else {
      size = initial || '100%';
    }

    return size;
  };

  const lottieStyles = {
    width: getSize(width),
    height: getSize(height),
    overflow: 'hidden',
    margin: '0 auto',
    outline: 'none',
    ...style,
  };

  return <div ref={el} style={lottieStyles} />;
}

export default Lottie;
