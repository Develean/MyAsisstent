import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, Square } from 'lucide-react-native';

interface FocusControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onResetTimer: () => void;
}

export const FocusControls: React.FC<FocusControlsProps> = ({
  isRunning,
  onTogglePlay,
  onResetTimer,
}) => {
  return (
    <View style={styles.actionButtonsRow}>
      {/* Big Blue Play / Pause Button: 76x76px */}
      <TouchableOpacity
        style={styles.mainPlayPauseButton}
        onPress={onTogglePlay}
        activeOpacity={0.85}
      >
        {isRunning ? (
          <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Play size={28} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
        )}
      </TouchableOpacity>

      {/* Secondary Stop / Reset Button: 56x56px */}
      <TouchableOpacity
        style={styles.secondaryStopButton}
        onPress={onResetTimer}
        activeOpacity={0.8}
      >
        <Square size={20} color="#0F1B33" fill="#0F1B33" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 28,
  },
  mainPlayPauseButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  secondaryStopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF4FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
