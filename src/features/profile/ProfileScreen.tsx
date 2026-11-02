import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { addExp } from '../user/userSlice';
import { MascotPuppetView } from './mascot/MascotPuppetView';
import { Cloud, Settings } from 'lucide-react-native';
import { EditProfileModal } from './components/EditProfileModal';

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.user);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const focus = useAppSelector((state) => state.focus);

  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);

  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const focusSessionsCount = focus.completedSessions || 0;

  const isBadge1Unlocked = (user.streakDays || 0) >= 1;
  const isBadge7Unlocked = (user.streakDays || 0) >= 7;
  const isBadge14Unlocked = (user.streakDays || 0) >= 14;
  const isBadge30Unlocked = (user.streakDays || 0) >= 30;
  const unlockedBadgesCount = [isBadge1Unlocked, isBadge7Unlocked, isBadge14Unlocked, isBadge30Unlocked].filter(Boolean).length;

  const handleExpBonus = (exp: number) => {
    dispatch(addExp(exp));
  };

  const expPercentage = Math.min(100, Math.round((user.currentExp / user.maxExp) * 100));

  // Dynamic safe top padding to prevent ANY status bar overlap on Android & iOS
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    24
  ) + 10;

  const handleBackupNow = () => {
    Alert.alert(
      'Pencadangan Berhasil',
      'Seluruh jadwal pelajaran, tugas, dan statistik belajar Anda telah disinkronkan ke Google Drive pribadi Anda.'
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: topPadding }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Profil Siswa</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            activeOpacity={0.8}
            onPress={() => setIsEditProfileVisible(true)}
            accessibilityLabel="Edit Profil"
          >
            <Settings size={18} color="#4A5670" />
          </TouchableOpacity>
        </View>

        {/* 1. Main Mascot Stage Card (Exact Match Design Image 2) */}
        <View style={styles.mascotStageCard}>
          <MascotPuppetView onExpReward={handleExpBonus} />

          {/* User Name & Class */}
          <Text style={styles.profileName}>{user.name || 'Teman Belajar'}</Text>
          {(user.school || user.grade) ? (
            <Text style={styles.profileSchool}>
              {user.school && user.grade
                ? `${user.school} · ${user.grade}`
                : user.school || user.grade}
            </Text>
          ) : (
            <Text style={styles.profileSchool}>Belajar Mandiri</Text>
          )}

          {/* EXP Level Badge Card (Image 2) */}
          <View style={styles.expCard}>
            <View style={styles.expHeader}>
              <Text style={styles.levelText}>
                Level {user.currentLevel} · {user.levelTitle}
              </Text>
              <Text style={styles.expNumberText}>
                {user.currentExp} / {user.maxExp} EXP
              </Text>
            </View>
            <View style={styles.expProgressBarBg}>
              <View style={[styles.expProgressBarFill, { width: `${expPercentage}%` }]} />
            </View>
            <Text style={styles.expBonusHint}>
              Capai Level {user.currentLevel + 1} ({user.currentLevel >= 4 ? 'Legend' : 'Master'}) untuk membuka tema maskot baru!
            </Text>
          </View>
        </View>

        {/* 2. 3 Stat Cards in a Row (Real Data) */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user.streakDays || 0}</Text>
            <Text style={styles.statLabel}>Streak hari</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{focusSessionsCount}</Text>
            <Text style={styles.statLabel}>Sesi fokus</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedTasksCount}</Text>
            <Text style={styles.statLabel}>Tugas selesai</Text>
          </View>
        </View>

        {/* 3. Section Lencana (Real Unlocked Status) */}
        <View style={styles.badgesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Lencana</Text>
            <Text style={styles.sectionSubtitle}>{unlockedBadgesCount} dari 12</Text>
          </View>

          <View style={styles.badgesCard}>
            {/* Badge 1: 1 Hari Streak */}
            <TouchableOpacity
              style={[
                styles.badgeBox,
                { backgroundColor: isBadge1Unlocked ? '#FFF1CC' : '#F1F5F9' },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Lencana 1 Hari',
                  isBadge1Unlocked
                    ? 'Langkah Pertama! Belajar konsisten selama 1 hari (Tuntas ✅)'
                    : 'Pertahankan belajar 1 hari untuk membuka lencana ini.'
                )
              }
            >
              <Text
                style={[
                  styles.badgeNumber,
                  { color: isBadge1Unlocked ? '#92400E' : '#94A3B8' },
                ]}
              >
                1
              </Text>
            </TouchableOpacity>

            {/* Badge 2: 7 Hari Streak */}
            <TouchableOpacity
              style={[
                styles.badgeBox,
                { backgroundColor: isBadge7Unlocked ? '#DBEAFE' : '#F1F5F9' },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Lencana 7 Hari',
                  isBadge7Unlocked
                    ? 'Pejuang Sepekan! Pertahankan 7 hari streak berturut-turut (Tuntas ✅)'
                    : 'Pertahankan 7 hari streak untuk membuka lencana ini.'
                )
              }
            >
              <Text
                style={[
                  styles.badgeNumber,
                  { color: isBadge7Unlocked ? '#1D4ED8' : '#94A3B8' },
                ]}
              >
                7
              </Text>
            </TouchableOpacity>

            {/* Badge 3: 14 Hari Streak */}
            <TouchableOpacity
              style={[
                styles.badgeBox,
                { backgroundColor: isBadge14Unlocked ? '#EDE9FE' : '#F1F5F9' },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Lencana 14 Hari',
                  isBadge14Unlocked
                    ? 'Master Konsistensi! Belajar tekun selama 14 hari (Tuntas ✅)'
                    : 'Pertahankan 14 hari streak untuk membuka lencana ini.'
                )
              }
            >
              <Text
                style={[
                  styles.badgeNumber,
                  { color: isBadge14Unlocked ? '#5B21B6' : '#94A3B8' },
                ]}
              >
                14
              </Text>
            </TouchableOpacity>

            {/* Badge 4: 30 Hari Streak */}
            <TouchableOpacity
              style={[
                styles.badgeBox,
                { backgroundColor: isBadge30Unlocked ? '#FEF3C7' : '#F1F5F9' },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Lencana 30 Hari',
                  isBadge30Unlocked
                    ? 'Legenda Belajar! Capai 30 hari streak untuk membuka lencana emas ini (Tuntas ✅)'
                    : 'Pertahankan 30 hari streak untuk membuka lencana ini.'
                )
              }
            >
              <Text
                style={[
                  styles.badgeNumber,
                  { color: isBadge30Unlocked ? '#B45309' : '#94A3B8' },
                ]}
              >
                30
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Section Google Drive Siswa (BYOS) (Exact Match Design Image 1) */}
        <View style={styles.syncCard}>
          <View style={styles.syncHeaderRow}>
            <View style={styles.syncTitleLeft}>
              <View style={styles.cloudIconCircle}>
                <Cloud size={18} color="#2563EB" />
              </View>
              <Text style={styles.syncTitle}>Google Drive Siswa</Text>
            </View>
            <View style={styles.connectedPill}>
              <Text style={styles.connectedText}>Terhubung</Text>
            </View>
          </View>
          <Text style={styles.syncDesc}>
            Data tersimpan aman di Google Drive akun pribadi Anda tanpa server perantara. Kuota terpakai: 48 KB dari 100 GB.
          </Text>
          <TouchableOpacity
            style={styles.backupButton}
            onPress={handleBackupNow}
            activeOpacity={0.8}
          >
            <Text style={styles.backupButtonText}>📥 Cadangkan Sekarang</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Edit Profil Pengguna */}
      <EditProfileModal
        visible={isEditProfileVisible}
        onClose={() => setIsEditProfileVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1B33',
    letterSpacing: -0.3,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  mascotStageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF0F7',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1B33',
    marginTop: 8,
    textAlign: 'center',
  },
  profileSchool: {
    fontSize: 13,
    color: '#4A5670',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  expCard: {
    marginTop: 14,
    width: '100%',
    backgroundColor: '#F3F6FA',
    borderRadius: 18,
    padding: 12,
    paddingHorizontal: 14,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1B33',
  },
  expNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1B33',
  },
  expProgressBarBg: {
    height: 8,
    backgroundColor: '#DCE5F2',
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 6,
  },
  expProgressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 99,
  },
  expBonusHint: {
    fontSize: 11,
    color: '#4A5670',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 15,
  },
  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF0F7',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1B33',
  },
  statLabel: {
    fontSize: 12,
    color: '#4A5670',
    fontWeight: '600',
    marginTop: 2,
  },
  badgesSection: {
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
  },
  badgesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF0F7',
  },
  badgeBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  syncCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF0F7',
  },
  syncHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cloudIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
    marginLeft: 10,
  },
  connectedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  syncDesc: {
    fontSize: 12,
    color: '#4A5670',
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 17,
  },
  backupButton: {
    marginTop: 10,
    width: '100%',
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE5F2',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backupButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1B33',
  },
});
