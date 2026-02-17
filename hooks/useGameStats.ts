
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats, UnlockedItem } from '@/types/game';

const STORAGE_KEY = 'popmaster_stats';

const DEFAULT_UNLOCKS: UnlockedItem[] = [
  { id: '1', type: 'color', name: 'Pink Blast', color: '#FF6B9D', unlocked: true },
  { id: '2', type: 'color', name: 'Turquoise Dream', color: '#4ECDC4', unlocked: true },
  { id: '3', type: 'color', name: 'Sunny Yellow', color: '#FFE66D', unlocked: false },
  { id: '4', type: 'color', name: 'Purple Haze', color: '#A78BFA', unlocked: false },
  { id: '5', type: 'color', name: 'Mint Fresh', color: '#6EE7B7', unlocked: false },
  { id: '6', type: 'color', name: 'Orange Burst', color: '#FB923C', unlocked: false },
];

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>({
    totalPops: 0,
    longestChain: 0,
    favoriteMode: 'bubble',
    unlockedItems: DEFAULT_UNLOCKS,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedStats = JSON.parse(stored);
        setStats(parsedStats);
      }
    } catch (error) {
      console.log('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveStats = async (newStats: GameStats) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.log('Error saving stats:', error);
    }
  };

  const incrementPops = (count: number = 1) => {
    const newStats = {
      ...stats,
      totalPops: stats.totalPops + count,
    };
    
    // Unlock items based on total pops
    const updatedUnlocks = newStats.unlockedItems.map(item => {
      if (!item.unlocked) {
        if (item.id === '3' && newStats.totalPops >= 50) return { ...item, unlocked: true };
        if (item.id === '4' && newStats.totalPops >= 100) return { ...item, unlocked: true };
        if (item.id === '5' && newStats.totalPops >= 200) return { ...item, unlocked: true };
        if (item.id === '6' && newStats.totalPops >= 500) return { ...item, unlocked: true };
      }
      return item;
    });
    
    newStats.unlockedItems = updatedUnlocks;
    saveStats(newStats);
  };

  const updateChain = (chainLength: number) => {
    if (chainLength > stats.longestChain) {
      const newStats = {
        ...stats,
        longestChain: chainLength,
      };
      saveStats(newStats);
    }
  };

  return {
    stats,
    loading,
    incrementPops,
    updateChain,
  };
}
