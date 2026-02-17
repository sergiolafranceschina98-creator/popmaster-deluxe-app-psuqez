
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useGameStats } from '@/hooks/useGameStats';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { stats, loading } = useGameStats();

  const paddingTop = Platform.OS === 'android' ? 48 : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPopsText = stats.totalPops.toString();
  const longestChainText = stats.longestChain.toString();
  const unlockedCount = stats.unlockedItems.filter(item => item.unlocked).length;
  const totalCount = stats.unlockedItems.length;
  const unlockedText = `${unlockedCount}/${totalCount}`;

  return (
    <SafeAreaView style={[styles.container, { paddingTop }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Unlocks & Achievements</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <IconSymbol
              android_material_icon_name="bubble-chart"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.statValue}>{totalPopsText}</Text>
            <Text style={styles.statLabel}>Total Pops</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol
              android_material_icon_name="link"
              size={32}
              color={colors.secondary}
            />
            <Text style={styles.statValue}>{longestChainText}</Text>
            <Text style={styles.statLabel}>Longest Chain</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol
              android_material_icon_name="star"
              size={32}
              color={colors.accent}
            />
            <Text style={styles.statValue}>{unlockedText}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unlocked Colors</Text>
          <View style={styles.colorGrid}>
            {stats.unlockedItems.map((item) => {
              const isUnlocked = item.unlocked;
              
              return (
                <View
                  key={item.id}
                  style={[
                    styles.colorCard,
                    !isUnlocked && styles.colorCardLocked,
                  ]}
                >
                  {isUnlocked && item.color ? (
                    <LinearGradient
                      colors={[item.color, item.color + 'CC']}
                      style={styles.colorPreview}
                    />
                  ) : (
                    <View style={[styles.colorPreview, styles.lockedPreview]}>
                      <IconSymbol
                        android_material_icon_name="lock"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}
                  <Text style={[styles.colorName, !isUnlocked && styles.lockedText]}>
                    {item.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Unlock</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>🎯 Pop 50 bubbles → Unlock Sunny Yellow</Text>
            <Text style={styles.infoText}>🎯 Pop 100 bubbles → Unlock Purple Haze</Text>
            <Text style={styles.infoText}>🎯 Pop 200 bubbles → Unlock Mint Fresh</Text>
            <Text style={styles.infoText}>🎯 Pop 500 bubbles → Unlock Orange Burst</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  colorCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  colorCardLocked: {
    opacity: 0.5,
  },
  colorPreview: {
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedPreview: {
    backgroundColor: colors.card,
  },
  colorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  lockedText: {
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
