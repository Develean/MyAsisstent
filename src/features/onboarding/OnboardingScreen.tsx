import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store/store';
import { completeOnboarding } from '../user/userSlice';
import { LocalDataRepository } from '../../db/repository';
import { Calendar, Clock, Sparkles, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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

    // Persist to local SQLite
    LocalDataRepository.saveUserProfile({
      name: trimmedName,
      grade: trimmedGrade,
      school: trimmedSchool,
      currentLevel: 1,
      levelTitle: 'Pelajar Baru',
      currentExp: 0,
      maxExp: 100,
      streakDays: 0,
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
    <View className="flex-1 bg-surface-bg" style={{ paddingTop: topPadding }}>
      <View className="flex-1 px-6 justify-between py-6">
        {/* Top Header / Progress Dots */}
        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row space-x-2">
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                className={`h-2 rounded-full ${
                  activeSlide === idx ? 'w-8 bg-primary' : 'w-2 bg-surface-border'
                }`}
              />
            ))}
          </View>
          {activeSlide < 3 && (
            <TouchableOpacity onPress={() => setActiveSlide(3)}>
              <Text className="text-typography-muted font-bold text-sm">Lewati</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Carousel Content (Slides 0, 1, 2) */}
        {activeSlide < 3 ? (
          <View className="items-center my-auto">
            {/* Mascot Art */}
            <View className="w-52 h-52 items-center justify-center mb-6">
              <Image
                source={slides[activeSlide].image}
                className="w-48 h-48"
                resizeMode="contain"
              />
            </View>

            {/* Feature Badge */}
            <View className="flex-row items-center bg-primary-light border border-primary-border px-3 py-1.5 rounded-full mb-3 gap-1.5">
              {slides[activeSlide].icon}
              <Text className="text-primary font-bold text-xs">
                {slides[activeSlide].badge}
              </Text>
            </View>

            {/* Title & Description */}
            <Text className="text-2xl font-extrabold text-typography-main text-center mb-3">
              {slides[activeSlide].title}
            </Text>
            <Text className="text-typography-muted text-center text-sm leading-6 px-4">
              {slides[activeSlide].desc}
            </Text>
          </View>
        ) : (
          /* Slide 3: Input Nama & Jenjang Siswa */
          <ScrollView showsVerticalScrollIndicator={false} className="my-auto">
            <View className="items-center mb-4">
              <Image
                source={require('../../../assets/merayakan.png')}
                className="w-36 h-36 mb-2"
                resizeMode="contain"
              />
              <Text className="text-2xl font-extrabold text-typography-main text-center">
                Kenalan Dulu Yuk!
              </Text>
              <Text className="text-typography-muted text-center text-xs mt-1 px-6">
                Siapa nama panggilanmu? Maskot kami ingin menyapamu setiap hari.
              </Text>
            </View>

            {/* 1. Input Nama Panggilan (Wajib) */}
            <View className="bg-white rounded-card p-4 border border-surface-border shadow-sm mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-bold text-typography-muted">
                  NAMA PANGGILAN
                </Text>
                <Text className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                  Wajib
                </Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Misal: Develean atau Budi"
                placeholderTextColor="#94A3B8"
                className="text-base font-bold text-typography-main py-1"
                autoFocus
              />
            </View>

            {/* 2. Input Jenjang / Status (Input Bebas - General) */}
            <View className="bg-white rounded-card p-4 border border-surface-border shadow-sm mb-4">
              <Text className="text-xs font-bold text-typography-muted mb-2">
                JENJANG / STATUS (OPSIONAL)
              </Text>
              <TextInput
                value={grade}
                onChangeText={setGrade}
                placeholder="Misal: Kelas 11 MIPA, Mahasiswa, atau Umum"
                placeholderTextColor="#94A3B8"
                className="text-sm font-semibold text-typography-main py-1"
              />
            </View>

            {/* 3. Input Asal Sekolah / Kampus / Instansi (Opsional) */}
            <View className="bg-white rounded-card p-4 border border-surface-border shadow-sm mb-2">
              <Text className="text-xs font-bold text-typography-muted mb-2">
                ASAL SEKOLAH / KAMPUS / INSTANSI (OPSIONAL)
              </Text>
              <TextInput
                value={school}
                onChangeText={setSchool}
                placeholder="Misal: SMAN 1 Jakarta atau Nama Kampus"
                placeholderTextColor="#94A3B8"
                className="text-sm font-semibold text-typography-main py-1"
              />
            </View>
          </ScrollView>
        )}

        {/* Bottom CTA Button */}
        <View className="mt-4">
          <TouchableOpacity
            onPress={handleNext}
            disabled={isButtonDisabled}
            className={`rounded-2xl py-4 flex-row items-center justify-center shadow-lg active:scale-95 gap-2 ${
              isButtonDisabled ? 'bg-slate-300' : 'bg-primary'
            }`}
            style={{ elevation: isButtonDisabled ? 0 : 4 }}
          >
            <Text className="text-white font-bold text-base">
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
export default OnboardingScreen;

