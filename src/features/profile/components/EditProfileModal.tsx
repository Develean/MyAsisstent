import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X, User, GraduationCap, Building } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { updateProfile } from '../../user/userSlice';
import { LocalDataRepository } from '../../../db/repository';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState(user.grade);
  const [school, setSchool] = useState(user.school);

  useEffect(() => {
    if (visible) {
      setName(user.name);
      setGrade(user.grade);
      setSchool(user.school);
    }
  }, [visible, user]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Nama Wajib Diisi', 'Silakan masukkan nama panggilan Anda.');
      return;
    }

    const trimmedGrade = grade.trim();
    const trimmedSchool = school.trim();

    // 1. Simpan permanen ke SQLite lokal
    LocalDataRepository.saveUserProfile({
      name: trimmedName,
      grade: trimmedGrade,
      school: trimmedSchool,
      currentLevel: user.currentLevel,
      levelTitle: user.levelTitle,
      currentExp: user.currentExp,
      maxExp: user.maxExp,
      streakDays: user.streakDays,
      hasCompletedOnboarding: true,
    });

    // 2. Update state di Redux
    dispatch(
      updateProfile({
        name: trimmedName,
        grade: trimmedGrade,
        school: trimmedSchool,
      })
    );

    onClose();
    Alert.alert('Profil Diperbarui', 'Data profil Anda telah berhasil disimpan!');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalCard}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Edit Profil Pengguna</Text>
                  <Text style={styles.modalSubtitle}>Sesuaikan identitas belajarmu kapan saja</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Field 1: Nama Panggilan */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <View style={styles.iconLabelRow}>
                    <User size={13} color="#2563EB" style={{ marginRight: 6 }} />
                    <Text style={styles.inputLabel}>NAMA PANGGILAN</Text>
                  </View>
                  <Text style={styles.requiredBadge}>Wajib</Text>
                </View>
                <TextInput
                  style={styles.inputField}
                  value={name}
                  onChangeText={setName}
                  placeholder="Misal: Develean"
                  placeholderTextColor="#94A3B8"
                  maxLength={50}
                />
              </View>

              {/* Field 2: Jenjang / Kelas / Status */}
              <View style={styles.inputGroup}>
                <View style={styles.iconLabelRow}>
                  <GraduationCap size={13} color="#2563EB" style={{ marginRight: 6 }} />
                  <Text style={styles.inputLabel}>JENJANG / STATUS</Text>
                </View>
                <TextInput
                  style={styles.inputField}
                  value={grade}
                  onChangeText={setGrade}
                  placeholder="Misal: Kelas 11 MIPA / Mahasiswa / Umum"
                  placeholderTextColor="#94A3B8"
                  maxLength={50}
                />
              </View>

              {/* Field 3: Asal Sekolah / Kampus / Instansi */}
              <View style={styles.inputGroup}>
                <View style={styles.iconLabelRow}>
                  <Building size={13} color="#2563EB" style={{ marginRight: 6 }} />
                  <Text style={styles.inputLabel}>ASAL SEKOLAH / INSTANSI</Text>
                </View>
                <TextInput
                  style={styles.inputField}
                  value={school}
                  onChangeText={setSchool}
                  placeholder="Misal: SMAN 1 Jakarta / Nama Kampus"
                  placeholderTextColor="#94A3B8"
                  maxLength={50}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 51, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EDF1F7',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B33',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  requiredBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1B33',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  saveBtn: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

