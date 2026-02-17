
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface ParticleEffectProps {
  x: number;
  y: number;
  color: string;
  onComplete: () => void;
}

export default function ParticleEffect({ x, y, color, onComplete }: ParticleEffectProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1.5, {
      damping: 10,
      stiffness: 100,
    });
    
    opacity.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
    
    translateY.value = withTiming(-50, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
