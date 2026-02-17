
import { StyleSheet } from 'react-native';

// PopMaster Deluxe Color Palette - Vibrant and Playful
export const colors = {
  // Main colors
  background: '#0F0F23',
  backgroundLight: '#1A1A35',
  card: '#252545',
  text: '#FFFFFF',
  textSecondary: '#A8A8D8',
  
  // Vibrant accent colors for bubbles and effects
  primary: '#FF6B9D',      // Hot Pink
  secondary: '#4ECDC4',    // Turquoise
  accent: '#FFE66D',       // Yellow
  highlight: '#A78BFA',    // Purple
  
  // Bubble colors
  bubbleRed: '#FF6B9D',
  bubbleBlue: '#4ECDC4',
  bubbleYellow: '#FFE66D',
  bubblePurple: '#A78BFA',
  bubbleGreen: '#6EE7B7',
  bubbleOrange: '#FB923C',
  
  // UI states
  success: '#6EE7B7',
  warning: '#FFE66D',
  error: '#FF6B9D',
  
  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(15, 15, 35, 0.8)',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
