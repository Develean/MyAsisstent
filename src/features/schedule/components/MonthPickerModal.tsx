import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react-native';

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

interface MonthPickerModalProps {
  visible: boolean;
  selectedYear: number;
  selectedMonthIndex: number;
  onSelectMonth: (monthIndex: number, year: number) => void;
  onResetToCurrentMonth: () => void;
  onClose: () => void;
}

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  selectedYear,
  selectedMonthIndex,
  onSelectMonth,
  onResetToCurrentMonth,
  onClose,
}) => {
  const [tempYear, setTempYear] = useState<number>(selectedYear);

  useEffect(() => {
    if (visible) {
      setTempYear(selectedYear);
    }
  }, [visible, selectedYear]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.monthPickerCard}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.modalHeaderRow}>
            <View style={styles.yearControlBox}>
              <TouchableOpacity
                style={styles.yearArrowBtn}
                onPress={() => setTempYear((prev) => prev - 1)}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color="#0F1B33" />
              </TouchableOpacity>

              <Text style={styles.pickerYearText}>{tempYear}</Text>

              <TouchableOpacity
                style={styles.yearArrowBtn}
                onPress={() => setTempYear((prev) => prev + 1)}
                activeOpacity={0.7}
              >
                <ChevronRight size={20} color="#0F1B33" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color="#4A5670" />
            </TouchableOpacity>
          </View>

          <Text style={styles.pickerInstructionText}>
            Pilih bulan untuk melihat seluruh tanggal jadwal pelajaran:
          </Text>

          {/* Months Grid */}
          <View style={styles.monthsGrid}>
            {INDONESIAN_MONTHS.map((monthName, idx) => {
              const isSelected =
                idx === selectedMonthIndex && tempYear === selectedYear;
              return (
                <TouchableOpacity
                  key={monthName}
                  style={[
                    styles.monthGridItem,
                    isSelected && styles.monthGridItemActive,
                  ]}
                  onPress={() => onSelectMonth(idx, tempYear)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.monthGridItemText,
                      isSelected && styles.monthGridItemTextActive,
                    ]}
                  >
                    {monthName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reset to Today Button */}
          <TouchableOpacity
            style={styles.resetToTodayBtn}
            onPress={onResetToCurrentMonth}
            activeOpacity={0.8}
          >
            <RotateCcw size={15} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.resetToTodayBtnText}>Kembali ke Hari Ini</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 51, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  monthPickerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearControlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yearArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerYearText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B33',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerInstructionText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  monthGridItem: {
    width: '31%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  monthGridItemActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  monthGridItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1B33',
  },
  monthGridItemTextActive: {
    color: '#FFFFFF',
  },
  resetToTodayBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  resetToTodayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
});
