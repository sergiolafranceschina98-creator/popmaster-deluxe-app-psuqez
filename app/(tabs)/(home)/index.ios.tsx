
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { GameMode } from '@/types/game';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface ModeCard {
  id: GameMode;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
  textColor?: string;
  iconColor?: string;
}

const GAME_MODES: ModeCard[] = [
  {
    id: 'bubble',
    title: 'Bubble Pop',
    description: 'Classic popping fun with satisfying effects',
    icon: 'bubble-chart',
    gradient: ['#FF6B9D', '#FF8FAB'],
  },
  {
    id: 'chain',
    title: 'Chain Pop',
    description: 'Create chain reactions for bigger rewards',
    icon: 'link',
    gradient: ['#4ECDC4', '#6ED9D2'],
  },
  {
    id: 'color',
    title: 'Color Flow',
    description: 'Zen mode - paint with flowing colors',
    icon: 'palette',
    gradient: ['#FFE66D', '#FFED8B'],
    textColor: '#1A1A35',
    iconColor: '#1A1A35',
  },
  {
    id: 'rush',
    title: 'Rush Mode',
    description: 'Pop as many as you can in 60 seconds!',
    icon: 'timer',
    gradient: ['#A78BFA', '#BFA3FC'],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const handleModeSelect = useCallback((mode: GameMode) => {
    console.log('User selected game mode:', mode);
    setSelectedMode(mode);
    
    // Navigate to game screen
    router.push(`/game/${mode}`);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>PopMaster Deluxe</Text>
        <Text style={styles.subtitle}>Choose your game mode</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.modesContainer}
        showsVerticalScrollIndicator={false}
      >
        {GAME_MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const textColor = mode.textColor || colors.text;
          const iconColor = mode.iconColor || colors.text;
          const descriptionColor = mode.textColor ? `${mode.textColor}CC` : 'rgba(255, 255, 255, 0.9)';
          
          return (
            <Pressable
              key={mode.id}
              onPress={() => handleModeSelect(mode.id)}
              style={({ pressed }) => [
                styles.modeCard,
                pressed && styles.modeCardPressed,
                isSelected && styles.modeCardSelected,
              ]}
            >
              <LinearGradient
                colors={mode.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modeGradient}
              >
                <View style={styles.modeIcon}>
                  <IconSymbol
                    android_material_icon_name={mode.icon as any}
                    size={40}
                    color={iconColor}
                  />
                </View>
                <View style={styles.modeContent}>
                  <Text style={[styles.modeTitle, { color: textColor }]}>{mode.title}</Text>
                  <Text style={[styles.modeDescription, { color: descriptionColor }]}>{mode.description}</Text>
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap any mode to start playing!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  modesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  modeCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modeCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  modeCardSelected: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  modeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 120,
  },
  modeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
