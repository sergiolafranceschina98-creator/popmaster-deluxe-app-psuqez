
import React, { useEffect } from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Bubble as BubbleType } from '@/types/game';

interface BubbleProps {
  bubble: BubbleType;
  onPop: (id: string) => void;
}

// Simple pop sound using Web Audio API for web, native audio for mobile
const playPopSound = async () => {
  if (Platform.OS === 'web') {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Web audio error:', error);
    }
  }
};

export default function Bubble({ bubble, onPop }: BubbleProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });
  }, []);

  const handlePress = () => {
    console.log('Bubble tapped:', bubble.id);
    
    playPopSound();
    
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withTiming(0, { duration: 150 })
    );
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onPop)(bubble.id);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: bubble.x,
          top: bubble.y,
          width: bubble.size,
          height: bubble.size,
          borderRadius: bubble.size / 2,
          backgroundColor: bubble.color,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        style={styles.pressable}
        onPress={handlePress}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pressable: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
});
