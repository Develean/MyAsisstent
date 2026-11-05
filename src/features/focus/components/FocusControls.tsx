import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';

interface FocusControlsProps {
  isRunning: boolean;
  canReset?: boolean;
  onTogglePlay: () => void;
  onResetTimer: () => void;
}

export const FocusControls: React.FC<FocusControlsProps> = ({
  isRunning,
  canReset = true,
  onTogglePlay,
  onResetTimer,
}) => {
  return (
    <View style={styles.actionButtonsRow}>
      {/* Symmetrical Left Slot: Guarantees the Play Button is 100% Dead-Centered */}
      <View style={styles.sideSlot} />

      {/* Main Hero Play / Pause Button */}
      <TouchableOpacity
        style={[
          styles.mainPlayPauseButton,
          isRunning && styles.mainPlayPauseButtonRunning,
        ]}
        onPress={onTogglePlay}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={isRunning ? 'Jeda sesi fokus' : 'Mulai sesi fokus'}
      >
        {isRunning ? (
          <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Play size={28} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
        )}
      </TouchableOpacity>

      {/* Symmetrical Right Slot: Reset Button (Always Available & Symmetrical) */}
      <View style={styles.sideSlot}>
        <TouchableOpacity
          style={[
            styles.secondaryResetButton,
            !canReset && styles.secondaryResetButtonIdle,
          ]}
          onPress={onResetTimer}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Reset waktu fokus"
        >
          <RotateCcw size={19} color={canReset ? '#1E293B' : '#94A3B8'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  sideSlot: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayPauseButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  mainPlayPauseButtonRunning: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  secondaryResetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryResetButtonIdle: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75,
  },
});
