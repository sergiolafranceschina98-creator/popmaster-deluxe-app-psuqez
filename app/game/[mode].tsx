
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { Bubble as BubbleType, GameMode } from '@/types/game';
import Bubble from '@/components/Bubble';
import ParticleEffect from '@/components/ParticleEffect';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useGameStats } from '@/hooks/useGameStats';

const { width, height } = Dimensions.get('window');

const BUBBLE_COLORS = [
  colors.bubbleRed,
  colors.bubbleBlue,
  colors.bubbleYellow,
  colors.bubblePurple,
  colors.bubbleGreen,
  colors.bubbleOrange,
];

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
}

export default function GameScreen() {
  const { mode } = useLocalSearchParams<{ mode: GameMode }>();
  const router = useRouter();
  const { incrementPops, updateChain } = useGameStats();
  
  const [bubbles, setBubbles] = useState<BubbleType[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [chainCount, setChainCount] = useState(0);
  const [isRushMode, setIsRushMode] = useState(mode === 'rush');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    console.log('Game started in mode:', mode);
    generateBubbles();
  }, [mode]);

  useEffect(() => {
    if (isRushMode && timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGameEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRushMode, timeLeft, gameOver]);

  const generateBubbles = useCallback(() => {
    const newBubbles: BubbleType[] = [];
    const bubbleCount = mode === 'rush' ? 30 : 20;
    
    for (let i = 0; i < bubbleCount; i++) {
      const size = 60 + Math.random() * 40;
      newBubbles.push({
        id: `bubble-${Date.now()}-${i}`,
        x: Math.random() * (width - size),
        y: Math.random() * (height - 300) + 100,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        size,
        type: 'normal',
      });
    }
    
    setBubbles(newBubbles);
    setScore(0);
    setChainCount(0);
    setTimeLeft(60);
    setGameOver(false);
  }, [mode]);

  const handleBubblePop = useCallback((id: string) => {
    console.log('Bubble popped:', id);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const poppedBubble = bubbles.find(b => b.id === id);
    if (poppedBubble) {
      const newParticle: Particle = {
        id: `particle-${Date.now()}`,
        x: poppedBubble.x + poppedBubble.size / 2,
        y: poppedBubble.y + poppedBubble.size / 2,
        color: poppedBubble.color,
      };
      setParticles(prev => [...prev, newParticle]);
    }
    
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    
    setScore((prev) => prev + 10);
    incrementPops(1);
    
    setChainCount((prev) => prev + 1);
    updateChain(chainCount + 1);
    
    setTimeout(() => {
      const size = 60 + Math.random() * 40;
      const newBubble: BubbleType = {
        id: `bubble-${Date.now()}`,
        x: Math.random() * (width - size),
        y: Math.random() * (height - 300) + 100,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        size,
        type: 'normal',
      };
      setBubbles((prev) => [...prev, newBubble]);
    }, 300);
  }, [incrementPops, updateChain, chainCount, bubbles]);

  const handleParticleComplete = useCallback((particleId: string) => {
    setParticles(prev => prev.filter(p => p.id !== particleId));
  }, []);

  const handleGameEnd = useCallback(() => {
    console.log('Game ended. Final score:', score);
    setGameOver(true);
  }, [score]);

  const handleBack = useCallback(() => {
    console.log('User navigating back to home');
    router.back();
  }, [router]);

  const handlePlayAgain = useCallback(() => {
    console.log('User restarting game');
    generateBubbles();
  }, [generateBubbles]);

  const getModeTitle = () => {
    switch (mode) {
      case 'bubble': return 'Bubble Pop';
      case 'chain': return 'Chain Pop';
      case 'color': return 'Color Flow';
      case 'rush': return 'Rush Mode';
      default: return 'PopMaster';
    }
  };

  const modeTitle = getModeTitle();
  const scoreText = score.toString();
  const chainText = chainCount.toString();
  const timeText = `${timeLeft}s`;
  const finalScoreText = `Final Score: ${score}`;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: modeTitle,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <IconSymbol
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.text}
              />
            </Pressable>
          ),
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{scoreText}</Text>
          </View>
          
          {isRushMode && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>{timeText}</Text>
            </View>
          )}
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Chain</Text>
            <Text style={styles.statValue}>{chainText}</Text>
          </View>
        </View>

        <View style={styles.gameArea}>
          {bubbles.map((bubble) => (
            <Bubble key={bubble.id} bubble={bubble} onPop={handleBubblePop} />
          ))}
          
          {particles.map((particle) => (
            <ParticleEffect
              key={particle.id}
              x={particle.x}
              y={particle.y}
              color={particle.color}
              onComplete={() => handleParticleComplete(particle.id)}
            />
          ))}
        </View>

        {gameOver && (
          <View style={styles.gameOverOverlay}>
            <View style={styles.gameOverCard}>
              <Text style={styles.gameOverTitle}>Time&apos;s Up!</Text>
              <Text style={styles.gameOverScore}>{finalScoreText}</Text>
              <Pressable style={styles.playAgainButton} onPress={handlePlayAgain}>
                <Text style={styles.playAgainText}>Play Again</Text>
              </Pressable>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  gameOverScore: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  playAgainButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
