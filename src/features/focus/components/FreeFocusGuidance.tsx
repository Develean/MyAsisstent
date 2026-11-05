import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';

interface FreeFocusGuidanceProps {
  activeTasksCount: number;
  onOpenTaskPicker: () => void;
}

export const FreeFocusGuidance: React.FC<FreeFocusGuidanceProps> = ({
  activeTasksCount,
  onOpenTaskPicker,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.iconCircle}>
        <Sparkles size={18} color="#2563EB" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>Mode Belajar Mandiri</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {activeTasksCount > 0
            ? `${activeTasksCount} tugas tersedia untuk dikaitkan`
            : 'Fokus bebas tanpa tugas terikat. EXP tetap bertambah!'}
        </Text>
      </View>

      {activeTasksCount > 0 && (
        <TouchableOpacity
          style={styles.actionPillBtn}
          onPress={onOpenTaskPicker}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Kaitkan tugas"
        >
          <Text style={styles.actionPillText}>Pilih Tugas</Text>
          <ArrowRight size={13} color="#2563EB" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
    fontWeight: '500',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionPillText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
});
