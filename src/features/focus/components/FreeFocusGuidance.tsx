import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, Info } from 'lucide-react-native';

interface FreeFocusGuidanceProps {
  activeTasksCount: number;
  onOpenTaskPicker: () => void;
}

export const FreeFocusGuidance: React.FC<FreeFocusGuidanceProps> = ({
  activeTasksCount,
  onOpenTaskPicker,
}) => {
  return (
    <View style={styles.freeFocusGuidanceCard}>
      <View style={styles.guidanceIconCircle}>
        <Sparkles size={24} color="#2563EB" />
      </View>
      <Text style={styles.guidanceTitle}>Mode Belajar Mandiri Aktif</Text>
      <Text style={styles.guidanceSubtitle}>
        Timer Pomodoro siap menemani sesi belajar bebasmu. Ingin checklist langkah kerja terstruktur? Kaitkan dengan tugas aktif di bawah.
      </Text>
      {activeTasksCount > 0 ? (
        <TouchableOpacity
          style={styles.guidanceCtaBtn}
          onPress={onOpenTaskPicker}
          activeOpacity={0.85}
        >
          <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.guidanceCtaText}>
            Kaitkan dengan Tugas ({activeTasksCount} Tugas Aktif)
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.guidanceTipsBox}>
          <Info size={14} color="#64748B" style={{ marginRight: 6 }} />
          <Text style={styles.guidanceTipsText}>
            Belum ada tugas terdaftar. Belajar mandiri tetap menghasilkan EXP setiap sesi tuntas!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  freeFocusGuidanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  guidanceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  guidanceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1B33',
    marginBottom: 6,
    textAlign: 'center',
  },
  guidanceSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  guidanceCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    width: '100%',
  },
  guidanceCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  guidanceTipsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  guidanceTipsText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },
});
