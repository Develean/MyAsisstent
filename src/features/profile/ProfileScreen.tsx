import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { addExp } from '../user/userSlice';
import { MascotPuppetView } from './mascot/MascotPuppetView';
import { Award, Flame, CheckCircle, Clock, Settings } from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const tasks = useAppSelector((state) => state.tasks.tasks);

  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;

  const handleExpBonus = (exp: number) => {
    dispatch(addExp(exp));
  };

  const expPercentage = Math.min(100, Math.round((user.currentExp / user.maxExp) * 100));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Profil Siswa</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Mascot Interactive Stage Card */}
        <View style={styles.mascotStageCard}>
          <MascotPuppetView onExpReward={handleExpBonus} />

          <Text style={styles.profileName}>{user.name || 'Teman Belajar'}</Text>
          <Text style={styles.profileSchool}>
            {user.school ? `${user.school} · ` : ''}{user.grade || 'Kelas 11 MIPA 2'}
          </Text>

          {/* Gamification EXP Level Card */}
          <View style={styles.expCard}>
            <View style={styles.expHeader}>
              <View style={styles.levelBadge}>
                <Award size={14} color="#2563EB" />
                <Text style={styles.levelText}>Level {user.currentLevel} · {user.levelTitle}</Text>
              </View>
              <Text style={styles.expNumberText}>{user.currentExp}/{user.maxExp} EXP</Text>
            </View>
            <View style={styles.expProgressBarBg}>
              <View style={[styles.expProgressBarFill, { width: `${expPercentage}%` }]} />
            </View>
            <Text style={styles.expBonusHint}>
              💡 Tap maskot 3 kali atau selesaikan subtask untuk dapat +5 EXP!
            </Text>
          </View>
        </View>

        {/* Study Statistics Grid */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Statistik Belajarmu</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <CheckCircle size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{completedTasksCount}</Text>
            <Text style={styles.statLabel}>Tugas Selesai</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Flame size={20} color="#EA580C" />
            </View>
            <Text style={styles.statValue}>{user.streakDays} Hari</Text>
            <Text style={styles.statLabel}>Streak Belajar</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Clock size={20} color="#059669" />
            </View>
            <Text style={styles.statValue}>{user.currentLevel * 25} m</Text>
            <Text style={styles.statLabel}>Waktu Fokus</Text>
          </View>
        </View>

        {/* Study Badges Section */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Pencapaian & Lencana</Text>
          <Text style={styles.sectionLink}>Semua (4)</Text>
        </View>

        <View style={styles.badgesList}>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>🔥</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.badgeName}>Streak Pemula (3 Hari)</Text>
              <Text style={styles.badgeDesc}>Belajar konsisten tanpa bolos selama 3 hari</Text>
            </View>
            <View style={styles.badgeDonePill}>
              <Text style={styles.badgeDoneText}>Tuntas</Text>
            </View>
          </View>

          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>⏱️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.badgeName}>Master Pomodoro</Text>
              <Text style={styles.badgeDesc}>Selesaikan 5 sesi fokus 25 menit</Text>
            </View>
            <View style={styles.badgeDonePill}>
              <Text style={styles.badgeDoneText}>Tuntas</Text>
            </View>
          </View>

          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>🎓</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.badgeName}>Lulusan Terbaik (Level 5)</Text>
              <Text style={styles.badgeDesc}>Buka kostum toga wisuda untuk maskotmu!</Text>
            </View>
            <View style={[styles.badgeDonePill, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.badgeDoneText, { color: '#64748B' }]}>Level {user.currentLevel}/5</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 18,
    paddingBottom: 90,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  },
  mascotStageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F1B33',
    marginTop: 4,
  },
  profileSchool: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  expCard: {
    marginTop: 14,
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  expNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  expProgressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 6,
  },
  expProgressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  expBonusHint: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1B33',
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  badgesList: {
    gap: 10,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeEmoji: {
    fontSize: 26,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1B33',
  },
  badgeDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badgeDonePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeDoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
});
