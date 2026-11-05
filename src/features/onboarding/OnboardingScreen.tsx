import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store/store';
import { completeOnboarding } from '../user/userSlice';
import { LocalDataRepository } from '../../db/repository';
import { getDateOnlyString } from '../../shared/utils/dateUtils';
import { Calendar, Clock, Sparkles, ArrowRight } from 'lucide-react-native';

const slides = [
  {
    id: 1,
    title: 'Jadwal & Countdown Ujian',
    desc: 'Atur jadwal kelas mingguan dan pantau hitung mundur ujian (H-5) agar kamu selalu siap belajar tanpa panik sistem kebut semalam!',
    image: require('../../../assets/semangat.png'),
    badge: 'Jadwal Adaptif',
    icon: <Calendar size={13} color="#2563EB" />,
  },
  {
    id: 2,
    title: 'Timer Pomodoro & Kustom',
    desc: 'Cicil belajarmu dengan timer fokus 25/50 menit atau atur durasi bebas sesuai ritme belajarmu. Bebas distraksi dan 100% offline!',
    image: require('../../../assets/fokus.png'),
    badge: 'Mode Fokus',
    icon: <Clock size={13} color="#2563EB" />,
  },
  {
    id: 3,
    title: 'Maskot Teman Belajar Pintar',
    desc: 'Ditemani maskot hamster ceria yang hidup! Wajahnya berubah sesuai sisa deadline, melirik, dan selalu siap menemani harimu.',
    image: require('../../../assets/senang.png'),
    badge: 'Maskot Interaktif',
    icon: <Sparkles size={13} color="#2563EB" />,
  },
];

export const OnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeSlide, setActiveSlide] = useState(0);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');

  const isNameValid = name.trim().length > 0;
  const isButtonDisabled = activeSlide === 3 && !isNameValid;

  const handleNext = () => {
    if (activeSlide < slides.length) {
      setActiveSlide(activeSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (!isNameValid) return;
    const trimmedName = name.trim();
    const trimmedGrade = grade.trim();
    const trimmedSchool = school.trim();
    const today = getDateOnlyString();

    // Persist to local SQLite
    LocalDataRepository.saveUserProfile({
      name: trimmedName,
      grade: trimmedGrade,
      school: trimmedSchool,
      currentLevel: 1,
      levelTitle: 'Pelajar Baru',
      currentExp: 0,
      maxExp: 100,
      streakDays: 1,
      lastActiveDate: today,
      hasCompletedOnboarding: true,
    });

    // Update Redux state
    dispatch(
      completeOnboarding({
        name: trimmedName,
        grade: trimmedGrade,
        school: trimmedSchool,
      })
    );
  };

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    24
  ) + 8;

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <View style={styles.container}>
        {/* Top Header / Progress Dots */}
        <View style={styles.headerRow}>
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  activeSlide === idx ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
          {activeSlide < 3 && (
            <TouchableOpacity onPress={() => setActiveSlide(3)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.skipText}>Lewati</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Carousel Content (Slides 0, 1, 2) */}
        {activeSlide < 3 ? (
          <View style={styles.carouselContainer}>
            {/* Mascot Art */}
            <View style={styles.mascotBox}>
              <Image
                source={slides[activeSlide].image}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>

            {/* Feature Badge */}
            <View style={styles.featureBadge}>
              {slides[activeSlide].icon}
              <Text style={styles.badgeText}>
                {slides[activeSlide].badge}
              </Text>
            </View>

            {/* Title & Description */}
            <Text style={styles.slideTitle}>
              {slides[activeSlide].title}
            </Text>
            <Text style={styles.slideDesc}>
              {slides[activeSlide].desc}
            </Text>
          </View>
        ) : (
          /* Slide 3: Input Nama & Jenjang Siswa (General Input Form - Zero Emojis) */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
            <View style={styles.formHero}>
              <Image
                source={require('../../../assets/merayakan.png')}
                style={styles.formMascotImage}
                resizeMode="contain"
              />
              <Text style={styles.formTitle}>
                Kenalan Dulu Yuk!
              </Text>
              <Text style={styles.formSubtitle}>
                Siapa nama panggilanmu? Maskot kami ingin menyapamu setiap hari.
              </Text>
            </View>

            {/* 1. Input Nama Panggilan (Wajib) */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeaderRow}>
                <Text style={styles.inputLabel}>
                  NAMA PANGGILAN
                </Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredBadgeText}>Wajib</Text>
                </View>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Misal: Develean atau Budi"
                placeholderTextColor="#94A3B8"
                style={styles.textInputBold}
                autoFocus
              />
            </View>

            {/* 2. Input Jenjang / Status (General Form Input) */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>
                JENJANG / STATUS (OPSIONAL)
              </Text>
              <TextInput
                value={grade}
                onChangeText={setGrade}
                placeholder="Misal: Kelas 11 MIPA, Mahasiswa, atau Umum"
                placeholderTextColor="#94A3B8"
                style={styles.textInputRegular}
              />
            </View>

            {/* 3. Input Asal Sekolah / Kampus / Instansi (Opsional) */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>
                ASAL SEKOLAH / KAMPUS / INSTANSI (OPSIONAL)
              </Text>
              <TextInput
                value={school}
                onChangeText={setSchool}
                placeholder="Misal: SMAN 1 Jakarta atau Universitas Indonesia"
                placeholderTextColor="#94A3B8"
                style={styles.textInputRegular}
              />
            </View>
          </ScrollView>
        )}

        {/* Bottom CTA Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={isButtonDisabled}
            style={[
              styles.ctaButton,
              isButtonDisabled ? styles.ctaButtonDisabled : styles.ctaButtonActive,
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>
              {activeSlide < 3
                ? 'Lanjut'
                : isNameValid
                ? 'Mulai Belajar Sekarang'
                : 'Isi Nama Panggilan Terlebih Dahulu'}
            </Text>
            {activeSlide < 3 && <ArrowRight size={18} color="#FFFFFF" />}
            {activeSlide === 3 && isNameValid && <ArrowRight size={18} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#E2E8F0',
  },
  skipText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 14,
  },
  carouselContainer: {
    alignItems: 'center',
    marginVertical: 'auto',
  },
  mascotBox: {
    width: 208,
    height: 208,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mascotImage: {
    width: 192,
    height: 192,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  badgeText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F1B33',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  formContainer: {
    paddingVertical: 12,
  },
  formHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formMascotImage: {
    width: 130,
    height: 130,
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F1B33',
    textAlign: 'center',
  },
  formSubtitle: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 4,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  requiredBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  requiredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  textInputBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1B33',
    paddingVertical: 4,
  },
  textInputRegular: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1B33',
    paddingVertical: 4,
  },
  bottomBar: {
    marginTop: 12,
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaButtonActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonDisabled: {
    backgroundColor: '#CBD5E1',
    elevation: 0,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default OnboardingScreen;
