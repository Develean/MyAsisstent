import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
  return (
    <View style={styles.presetChipsRow}>
      <TouchableOpacity
        style={[
          styles.presetChip,
          durationMinutes === 25 && styles.presetChipActive,
        ]}
        onPress={() => onSelectPreset(25)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.presetChipText,
            durationMinutes === 25 && styles.presetChipTextActive,
          ]}
        >
          25 mnt
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.presetChip,
          durationMinutes === 50 && styles.presetChipActive,
        ]}
        onPress={() => onSelectPreset(50)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.presetChipText,
            durationMinutes === 50 && styles.presetChipTextActive,
          ]}
        >
          50 mnt
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.presetChip,
          durationMinutes !== 25 &&
            durationMinutes !== 50 &&
            styles.presetChipActive,
        ]}
        onPress={onOpenCustomModal}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.presetChipText,
            durationMinutes !== 25 &&
              durationMinutes !== 50 &&
              styles.presetChipTextActive,
          ]}
        >
          {durationMinutes !== 25 && durationMinutes !== 50
            ? `${durationMinutes} mnt`
            : 'Kustom'}
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
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
});
