
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
import { Bubble as BubbleType, GameMode, Tile, ColorCell } from '@/types/game';
import Bubble from '@/components/Bubble';
import ParticleEffect from '@/components/ParticleEffect';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useGameStats } from '@/hooks/useGameStats';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const BUBBLE_COLORS = [
  colors.bubbleRed,
  colors.bubbleBlue,
  colors.bubbleYellow,
  colors.bubblePurple,
  colors.bubbleGreen,
  colors.bubbleOrange,
];

const TILE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A8E6CF',
  '#FF8B94',
];

const FLOW_COLORS = [
  '#FF6B9D',
  '#C44569',
  '#FFA07A',
  '#98D8C8',
  '#6C5CE7',
  '#A29BFE',
  '#FD79A8',
  '#FDCB6E',
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
  
  // Bubble Pop Mode state
  const [bubbles, setBubbles] = useState<BubbleType[]>([]);
  
  // Chain Pop Mode state
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  
  // Color Flow Mode state
  const [colorGrid, setColorGrid] = useState<ColorCell[][]>([]);
  const [currentFlowColor, setCurrentFlowColor] = useState(FLOW_COLORS[0]);
  
  // Rush Mode state
  const [rushTargets, setRushTargets] = useState<BubbleType[]>([]);
  
  // Common state
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [chainCount, setChainCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [isRushMode, setIsRushMode] = useState(mode === 'rush');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    console.log('Game started in mode:', mode);
    initializeMode();
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

  const initializeMode = useCallback(() => {
    setScore(0);
    setChainCount(0);
    setComboMultiplier(1);
    setTimeLeft(60);
    setGameOver(false);
    setParticles([]);
    
    if (mode === 'bubble') {
      generateBubbles();
    } else if (mode === 'chain') {
      generateTileGrid();
    } else if (mode === 'color') {
      generateColorGrid();
    } else if (mode === 'rush') {
      generateRushTargets();
    }
  }, [mode]);

  // BUBBLE POP MODE - Classic floating bubbles
  const generateBubbles = useCallback(() => {
    const newBubbles: BubbleType[] = [];
    const bubbleCount = 15;
    
    for (let i = 0; i < bubbleCount; i++) {
      const size = 70 + Math.random() * 50;
      newBubbles.push({
        id: `bubble-${Date.now()}-${i}`,
        x: Math.random() * (width - size),
        y: Math.random() * (height - 350) + 120,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        size,
        type: 'normal',
      });
    }
    
    setBubbles(newBubbles);
  }, []);

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
    
    const points = 10 * comboMultiplier;
    setScore((prev) => prev + points);
    incrementPops(1);
    
    setComboMultiplier(prev => Math.min(prev + 0.5, 5));
    
    setTimeout(() => {
      const size = 70 + Math.random() * 50;
      const newBubble: BubbleType = {
        id: `bubble-${Date.now()}`,
        x: Math.random() * (width - size),
        y: Math.random() * (height - 350) + 120,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        size,
        type: 'normal',
      };
      setBubbles((prev) => [...prev, newBubble]);
    }, 400);
  }, [incrementPops, comboMultiplier, bubbles]);

  // CHAIN POP MODE - Grid-based pattern matching
  const generateTileGrid = useCallback(() => {
    const newTiles: Tile[] = [];
    const cols = 6;
    const rows = 8;
    const tileSize = (width - 40) / cols;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newTiles.push({
          id: `tile-${row}-${col}`,
          x: 20 + col * tileSize,
          y: 120 + row * tileSize,
          color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)],
          size: tileSize - 4,
          row,
          col,
          matched: false,
        });
      }
    }
    
    setTiles(newTiles);
    setSelectedTiles([]);
  }, []);

  const handleTileTap = useCallback((tileId: string) => {
    console.log('Tile tapped:', tileId);
    
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.matched) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const adjacentTiles = tiles.filter(t => 
      !t.matched &&
      t.color === tile.color &&
      (
        (Math.abs(t.row - tile.row) === 1 && t.col === tile.col) ||
        (Math.abs(t.col - tile.col) === 1 && t.row === tile.row)
      )
    );
    
    const matchedTileIds = [tile.id, ...adjacentTiles.map(t => t.id)];
    
    if (matchedTileIds.length > 1) {
      setTiles(prev => prev.map(t => 
        matchedTileIds.includes(t.id) ? { ...t, matched: true } : t
      ));
      
      matchedTileIds.forEach(id => {
        const matchedTile = tiles.find(t => t.id === id);
        if (matchedTile) {
          const newParticle: Particle = {
            id: `particle-${Date.now()}-${id}`,
            x: matchedTile.x + matchedTile.size / 2,
            y: matchedTile.y + matchedTile.size / 2,
            color: matchedTile.color,
          };
          setParticles(prev => [...prev, newParticle]);
        }
      });
      
      const chainLength = matchedTileIds.length;
      const points = chainLength * 20;
      setScore(prev => prev + points);
      setChainCount(prev => prev + chainLength);
      updateChain(chainLength);
      incrementPops(chainLength);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      setTimeout(() => {
        setTiles(prev => prev.map(t => {
          if (matchedTileIds.includes(t.id)) {
            return {
              ...t,
              color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)],
              matched: false,
            };
          }
          return t;
        }));
      }, 500);
    }
  }, [tiles, incrementPops, updateChain]);

  // COLOR FLOW MODE - Paint spreading simulation
  const generateColorGrid = useCallback(() => {
    const cols = 12;
    const rows = 16;
    const cellSize = (width - 40) / cols;
    const newGrid: ColorCell[][] = [];
    
    for (let row = 0; row < rows; row++) {
      const rowCells: ColorCell[] = [];
      for (let col = 0; col < cols; col++) {
        rowCells.push({
          id: `cell-${row}-${col}`,
          x: 20 + col * cellSize,
          y: 120 + row * cellSize,
          color: '#1A1A2E',
          size: cellSize - 2,
          row,
          col,
          intensity: 0,
        });
      }
      newGrid.push(rowCells);
    }
    
    setColorGrid(newGrid);
    setCurrentFlowColor(FLOW_COLORS[0]);
  }, []);

  const handleColorFlowTap = useCallback((row: number, col: number) => {
    console.log('Color flow tap at:', row, col);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    
    const newColor = currentFlowColor;
    
    // Use functional update to avoid stale state
    setColorGrid(prevGrid => {
      // Validate grid exists
      if (!prevGrid || prevGrid.length === 0 || !prevGrid[0]) {
        console.log('Grid not initialized yet');
        return prevGrid;
      }
      
      // Validate tap coordinates
      if (row < 0 || row >= prevGrid.length || col < 0 || col >= prevGrid[0].length) {
        console.log('Invalid tap coordinates:', row, col);
        return prevGrid;
      }
      
      // Calculate all cells to update using BFS
      const cellsToUpdate: Array<{ row: number; col: number; intensity: number }> = [];
      const visited = new Set<string>();
      const queue: Array<{ row: number; col: number; intensity: number; depth: number }> = [
        { row, col, intensity: 1, depth: 0 }
      ];
      
      const maxDepth = 4;
      const rows = prevGrid.length;
      const cols = prevGrid[0].length;
      
      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) break;
        
        const key = `${current.row}-${current.col}`;
        
        if (visited.has(key)) continue;
        if (current.row < 0 || current.row >= rows) continue;
        if (current.col < 0 || current.col >= cols) continue;
        if (current.depth > maxDepth) continue;
        if (current.intensity < 0.1) continue;
        
        visited.add(key);
        cellsToUpdate.push({
          row: current.row,
          col: current.col,
          intensity: current.intensity,
        });
        
        const nextIntensity = current.intensity * 0.7;
        const nextDepth = current.depth + 1;
        
        if (nextDepth <= maxDepth && nextIntensity >= 0.1) {
          queue.push({ row: current.row - 1, col: current.col, intensity: nextIntensity, depth: nextDepth });
          queue.push({ row: current.row + 1, col: current.col, intensity: nextIntensity, depth: nextDepth });
          queue.push({ row: current.row, col: current.col - 1, intensity: nextIntensity, depth: nextDepth });
          queue.push({ row: current.row, col: current.col + 1, intensity: nextIntensity, depth: nextDepth });
        }
      }
      
      console.log('Updating', cellsToUpdate.length, 'cells with color', newColor);
      
      // Create new grid with updates
      const newGrid = prevGrid.map(rowArray => rowArray.map(cell => ({ ...cell })));
      
      cellsToUpdate.forEach(({ row: r, col: c, intensity }) => {
        if (newGrid[r] && newGrid[r][c]) {
          const currentIntensity = newGrid[r][c].intensity;
          newGrid[r][c] = {
            ...newGrid[r][c],
            color: newColor,
            intensity: Math.min(1, currentIntensity + intensity),
          };
        }
      });
      
      return newGrid;
    });
    
    setScore(prev => prev + 5);
    incrementPops(1);
    
    const nextColorIndex = (FLOW_COLORS.indexOf(currentFlowColor) + 1) % FLOW_COLORS.length;
    setCurrentFlowColor(FLOW_COLORS[nextColorIndex]);
  }, [currentFlowColor, incrementPops]);

  // RUSH MODE - Fast-paced target popping
  const generateRushTargets = useCallback(() => {
    const newTargets: BubbleType[] = [];
    const targetCount = 40;
    
    for (let i = 0; i < targetCount; i++) {
      const size = 50 + Math.random() * 30;
      newTargets.push({
        id: `target-${Date.now()}-${i}`,
        x: Math.random() * (width - size),
        y: Math.random() * (height - 350) + 120,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        size,
        type: 'normal',
      });
    }
    
    setRushTargets(newTargets);
  }, []);

  const handleRushTargetPop = useCallback((id: string) => {
    console.log('Rush target popped:', id);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    const poppedTarget = rushTargets.find(t => t.id === id);
    if (poppedTarget) {
      const newParticle: Particle = {
        id: `particle-${Date.now()}`,
        x: poppedTarget.x + poppedTarget.size / 2,
        y: poppedTarget.y + poppedTarget.size / 2,
        color: poppedTarget.color,
      };
      setParticles(prev => [...prev, newParticle]);
    }
    
    setRushTargets((prev) => prev.filter((t) => t.id !== id));
    
    const points = 15;
    setScore((prev) => prev + points);
    setChainCount(prev => prev + 1);
    incrementPops(1);
  }, [incrementPops, rushTargets]);

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
    initializeMode();
  }, [initializeMode]);

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
  const comboText = `${comboMultiplier.toFixed(1)}x`;

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
          
          {mode === 'bubble' && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Combo</Text>
              <Text style={styles.statValue}>{comboText}</Text>
            </View>
          )}
          
          {mode !== 'color' && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pops</Text>
              <Text style={styles.statValue}>{chainText}</Text>
            </View>
          )}
        </View>

        <View style={styles.gameArea}>
          {/* BUBBLE POP MODE */}
          {mode === 'bubble' && bubbles.map((bubble) => (
            <Bubble key={bubble.id} bubble={bubble} onPop={handleBubblePop} mode="bubble" />
          ))}
          
          {/* CHAIN POP MODE */}
          {mode === 'chain' && tiles.map((tile) => (
            <Pressable
              key={tile.id}
              style={[
                styles.tile,
                {
                  left: tile.x,
                  top: tile.y,
                  width: tile.size,
                  height: tile.size,
                  backgroundColor: tile.matched ? 'transparent' : tile.color,
                  opacity: tile.matched ? 0 : 1,
                },
              ]}
              onPress={() => handleTileTap(tile.id)}
            >
              <View style={styles.tileInner} />
            </Pressable>
          ))}
          
          {/* COLOR FLOW MODE */}
          {mode === 'color' && (
            <View style={styles.colorGridContainer}>
              {colorGrid.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.colorRow}>
                  {row.map((cell) => (
                    <Pressable
                      key={cell.id}
                      style={[
                        styles.colorCell,
                        {
                          width: cell.size,
                          height: cell.size,
                          backgroundColor: cell.color,
                          opacity: 0.3 + cell.intensity * 0.7,
                        },
                      ]}
                      onPress={() => handleColorFlowTap(cell.row, cell.col)}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
          
          {/* RUSH MODE */}
          {mode === 'rush' && rushTargets.map((target) => (
            <Bubble key={target.id} bubble={target} onPop={handleRushTargetPop} mode="rush" />
          ))}
          
          {/* PARTICLES */}
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
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
              style={StyleSheet.absoluteFill}
            />
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
  tile: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tileInner: {
    flex: 1,
    borderRadius: 6,
  },
  colorGridContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  colorRow: {
    flexDirection: 'row',
  },
  colorCell: {
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
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
