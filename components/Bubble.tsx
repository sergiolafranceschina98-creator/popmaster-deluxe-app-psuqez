
import React, { useEffect } from 'react';
import { StyleSheet, Pressable, Platform, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
import { Bubble as BubbleType } from '@/types/game';
import { LinearGradient } from 'expo-linear-gradient';

interface BubbleProps {
  bubble: BubbleType;
  onPop: (id: string) => void;
  mode?: 'bubble' | 'rush';
}

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

export default function Bubble({ bubble, onPop, mode = 'bubble' }: BubbleProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const floatY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });
    
    if (mode === 'bubble') {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000 }),
          withTiming(10, { duration: 2000 })
        ),
        -1,
        true
      );
      
      rotation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 3000 }),
          withTiming(5, { duration: 3000 })
        ),
        -1,
        true
      );
    }
    
    if (mode === 'rush') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 300 }),
          withTiming(0.9, { duration: 300 })
        ),
        -1,
        true
      );
    }
  }, [mode]);

  const handlePress = () => {
    console.log('Bubble tapped:', bubble.id);
    
    playPopSound();
    
    scale.value = withSequence(
      withTiming(1.4, { duration: 80 }),
      withTiming(0, { duration: 120 })
    );
    opacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onPop)(bubble.id);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: floatY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const getGradientColors = (baseColor: string) => {
    const lighten = (color: string) => {
      const hex = color.replace('#', '');
      const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 40);
      const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 40);
      const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 40);
      const newHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      return newHex;
    };
    
    return [lighten(baseColor), baseColor];
  };

  const gradientColors = getGradientColors(bubble.color);

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
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.shine} />
        <Pressable
          style={styles.pressable}
          onPress={handlePress}
        />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    position: 'relative',
  },
  shine: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    width: '30%',
    height: '30%',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  pressable: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
});
