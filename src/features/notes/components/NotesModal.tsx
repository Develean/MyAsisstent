import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { addNote, deleteNote, NoteWithSubject } from '../noteSlice';
import { LocalDataRepository } from '../../../db/repository';
import { generateId } from '../../../shared/utils/idGenerator';
import { ActionFeedbackToast, ToastType } from '../../../shared/components/ActionFeedbackToast';
import {
  X,
  FileText,
  Plus,
  Trash2,
  BookOpen,
} from 'lucide-react-native';

interface NotesModalProps {
  visible: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultSubjectId?: number | null;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  visible,
  onClose,
  defaultDate,
  defaultSubjectId,
}) => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector((state) => state.notes.notes);
  const subjects = useAppSelector((state) => state.schedule.subjects);

  const [content, setContent] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    defaultSubjectId || (subjects.length > 0 ? subjects[0].id : null)
  );

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    subMessage?: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    subMessage: '',
    type: 'success',
  });

  const showToast = (message: string, subMessage?: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, subMessage, type });
  };

  const handleSaveNote = () => {
    if (!content.trim()) return;
    const noteSubjectId = selectedSubjectId || (subjects.length > 0 ? subjects[0].id : null);
    const chosenSubject = noteSubjectId ? subjects.find((s) => s.id === noteSubjectId) : undefined;

    const nowISO = new Date().toISOString();
    const newNote: NoteWithSubject = {
      id: generateId(),
      subjectId: noteSubjectId,
      date: defaultDate || nowISO.split('T')[0],
      content: content.trim(),
      createdAt: nowISO,
      subject: chosenSubject,
    };

    dispatch(addNote(newNote));
    LocalDataRepository.saveNote(newNote);

    setContent('');
    showToast('Catatan Disimpan', 'Rangkuman materi berhasil dicatat', 'success');
  };

  const handleDeleteNote = (noteId: number) => {
    dispatch(deleteNote(noteId));
    LocalDataRepository.deleteNote(noteId);
    showToast('Catatan Dihapus', 'Catatan materi telah dihapus', 'info');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.headerIconCircle}>
                    <FileText size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.headerTitle}>Catatan & Rangkuman</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Compose New Note */}
              <View style={styles.composeCard}>
                <Text style={styles.sectionLabel}>Tulis Catatan Baru</Text>

                {/* Subject Selector Chips */}
                {subjects.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subjectChipsRow}
                  >
                    {subjects.map((sub) => {
                      const isSelected = selectedSubjectId === sub.id;
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          style={[
                            styles.subjectChip,
                            isSelected && styles.subjectChipSelected,
                          ]}
                          onPress={() => setSelectedSubjectId(sub.id)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.subjectChipText,
                              isSelected && styles.subjectChipTextSelected,
                            ]}
                          >
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Content Input */}
                <TextInput
                  style={styles.textInput}
                  placeholder="Tulis rumus penting, PR, atau rangkuman guru..."
                  placeholderTextColor="#94A3B8"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    !content.trim() && styles.saveBtnDisabled,
                  ]}
                  onPress={handleSaveNote}
                  disabled={!content.trim()}
                  activeOpacity={0.85}
                >
                  <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>Simpan Catatan</Text>
                </TouchableOpacity>
              </View>

              {/* Saved Notes List */}
              <View style={styles.listHeaderRow}>
                <Text style={styles.sectionLabel}>Daftar Catatan Tersimpan</Text>
                <Text style={styles.countText}>{notes.length} catatan</Text>
              </View>

              <ScrollView style={styles.notesListScroll} showsVerticalScrollIndicator={false}>
                {notes.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <BookOpen size={24} color="#94A3B8" style={{ marginBottom: 6 }} />
                    <Text style={styles.emptyTitle}>Belum Ada Catatan</Text>
                    <Text style={styles.emptySubtitle}>
                      Tulis materi atau rumus penting di atas agar mudah dipelajari kembali sebelum ujian.
                    </Text>
                  </View>
                ) : (
                  notes.map((n) => {
                    const subName = n.subject?.name || 'Mata Pelajaran';
                    return (
                      <View key={n.id} style={styles.noteCard}>
                        <View style={styles.noteTopRow}>
                          <View style={styles.subjectTag}>
                            <Text style={styles.subjectTagText}>{subName}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleDeleteNote(n.id)}
                            style={styles.deleteNoteBtn}
                          >
                            <Trash2 size={15} color="#94A3B8" />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.noteContentText}>{n.content}</Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {/* Toast Feedback */}
              <ActionFeedbackToast
                visible={toast.visible}
                message={toast.message}
                subMessage={toast.subMessage}
                type={toast.type}
                onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
                topOffset={20}
              />
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
  },
  closeBtn: {
    padding: 6,
  },
  composeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDF1F7',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5670',
    marginBottom: 8,
  },
  subjectChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F2',
  },
  subjectChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subjectChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A5670',
  },
  subjectChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE5F2',
    padding: 12,
    fontSize: 13,
    color: '#0F1B33',
    minHeight: 70,
    marginBottom: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  notesListScroll: {
    maxHeight: 220,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1B33',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  noteCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  deleteNoteBtn: {
    padding: 4,
  },
  noteContentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
    lineHeight: 18,
  },
});
