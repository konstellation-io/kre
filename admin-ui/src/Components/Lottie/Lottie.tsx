import React, { useEffect, useRef } from 'react';
import lottie, {
  AnimationConfigWithData,
  AnimationConfigWithPath,
  AnimationDirection,
  AnimationItem
} from 'lottie-web/build/player/lottie_light';

interface LottieOptions {
  loop?: boolean;
  autoplay?: boolean;
  animationData: object;
}
type Props = {
  options: LottieOptions;
  segments: [number, number] | [number, number][];
  forceSegments: boolean;
  width: number;
  height: number;
  speed?: number;
  direction?: AnimationDirection;
  style?: object;
};

function Lottie({
  options = {
    loop: true,
    autoplay: true,
    animationData: {}
  },
  segments,
  forceSegments,
  width,
  height,
  speed = 1,
  direction = 1,
  style
}: Props) {
  const { loop, autoplay } = options;

  let el = useRef<HTMLDivElement>(null);
  let animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!animRef.current) {
      const autoPlaySegments = !segments && autoplay !== false;

      if (el.current === null) {
        return;
      }

      const lottieOptions: AnimationConfigWithPath | AnimationConfigWithData = {
        container: el.current,
        renderer: 'svg',
        loop: loop !== false,
        autoplay: autoPlaySegments ? false : autoplay,
        ...options
      };

      let anim: AnimationItem = lottie.loadAnimation(lottieOptions);
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
    ...style
  };

  return <div ref={el} style={lottieStyles} />;
}

export default Lottie;
