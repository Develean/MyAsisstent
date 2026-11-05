import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { triggerHaptic } from '../../../shared/utils/haptics';

interface DurationChipsProps {
  durationMinutes: number;
  onSelectPreset: (mins: number) => void;
  onOpenCustomModal: () => void;
}

export const DurationChips: React.FC<DurationChipsProps> = ({
  durationMinutes,
  onSelectPreset,
  onOpenCustomModal,
}) => {
  const is25Active = durationMinutes === 25;
  const is50Active = durationMinutes === 50;
  const isCustomActive = durationMinutes !== 25 && durationMinutes !== 50;

  return (
    <View style={styles.presetChipsRow}>
      <TouchableOpacity
        style={[
          styles.presetChip,
          is25Active && styles.presetChipActive,
        ]}
        onPress={() => {
          triggerHaptic('selection');
          onSelectPreset(25);
        }}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Pilih durasi 25 menit"
      >
        <Text
          style={[
            styles.presetChipText,
            is25Active && styles.presetChipTextActive,
          ]}
        >
          25 mnt
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.presetChip,
          is50Active && styles.presetChipActive,
        ]}
        onPress={() => {
          triggerHaptic('selection');
          onSelectPreset(50);
        }}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Pilih durasi 50 menit"
      >
        <Text
          style={[
            styles.presetChipText,
            is50Active && styles.presetChipTextActive,
          ]}
        >
          50 mnt
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.presetChip,
          isCustomActive && styles.presetChipActive,
        ]}
        onPress={() => {
          triggerHaptic('selection');
          onOpenCustomModal();
        }}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Pilih durasi kustom"
      >
        <Text
          style={[
            styles.presetChipText,
            isCustomActive && styles.presetChipTextActive,
          ]}
        >
          {isCustomActive ? `${durationMinutes} mnt` : 'Kustom'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  presetChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  presetChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  presetChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
