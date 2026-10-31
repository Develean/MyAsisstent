import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useAppDispatch } from '../../store/store';
import { completeOnboarding } from '../user/userSlice';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Jadwal & Countdown Ujian',
    desc: 'Atur jadwal kelas mingguan dan pantau hitung mundur ujian (H-5) agar kamu selalu siap belajar tanpa panik sistem kebut semalam!',
    image: require('../../../assets/semangat.png'),
    badge: '📅 Jadwal Adaptif',
  },
  {
    id: 2,
    title: 'Timer Pomodoro & Kustom',
    desc: 'Cicil belajarmu dengan timer fokus 25/50 menit atau atur durasi bebas sesuai ritme belajarmu. Bebas distraksi dan 100% offline!',
    image: require('../../../assets/fokus.png'),
    badge: '⏱️ Mode Fokus',
  },
  {
    id: 3,
    title: 'Maskot Teman Belajar Pintar',
    desc: 'Ditemani maskot hamster ceria yang hidup! Wajahnya berubah sesuai sisa deadline, melirik, dan selalu siap menemani harimu.',
    image: require('../../../assets/senang.png'),
    badge: '🐹 Maskot Interaktif',
  },
];

export const OnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeSlide, setActiveSlide] = useState(0);
  const [name, setName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Kelas 11 MIPA');
  const [school, setSchool] = useState('SMAN 1 Jakarta');

  const grades = ['Kelas 10 SMA', 'Kelas 11 MIPA', 'Kelas 11 IPS', 'Kelas 12 SMA', 'SMK'];

  const handleNext = () => {
    if (activeSlide < slides.length) {
      setActiveSlide(activeSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    dispatch(
      completeOnboarding({
        name: name.trim() || 'Develean',
        grade: selectedGrade,
        school: school.trim() || 'SMA Indonesia',
      })
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-bg">
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
            <View className="bg-primary-light border border-primary-border px-3 py-1.5 rounded-full mb-3">
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
                Kenalan Dulu Yuk! 🐹
              </Text>
              <Text className="text-typography-muted text-center text-xs mt-1 px-6">
                Siapa nama panggilanmu? Maskot kami ingin menyapamu setiap hari.
              </Text>
            </View>

            {/* Input Nama Panggilan */}
            <View className="bg-white rounded-card p-4 border border-surface-border shadow-sm mb-4">
              <Text className="text-xs font-bold text-typography-muted mb-2">
                NAMA PANGGILAN
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Misal: Develean"
                placeholderTextColor="#94A3B8"
                className="text-base font-bold text-typography-main py-1"
                autoFocus
              />
            </View>

            {/* Pilih Kelas / Jenjang */}
            <View className="bg-white rounded-card p-4 border border-surface-border shadow-sm mb-4">
              <Text className="text-xs font-bold text-typography-muted mb-2.5">
                PILIH JENJANG / KELAS
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {grades.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setSelectedGrade(g)}
                    className={`px-3 py-2 rounded-xl border ${
                      selectedGrade === g
                        ? 'bg-primary border-primary'
                        : 'bg-surface-bg border-surface-border'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        selectedGrade === g ? 'text-white' : 'text-typography-main'
                      }`}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Input Asal Sekolah (Opsional) */}
            <View className="bg-white rounded-card p-4 border border-surface-border shadow-sm mb-2">
              <Text className="text-xs font-bold text-typography-muted mb-2">
                ASAL SEKOLAH (OPSIONAL)
              </Text>
              <TextInput
                value={school}
                onChangeText={setSchool}
                placeholder="Misal: SMAN 1 Jakarta"
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
            className="bg-primary rounded-2xl py-4 items-center justify-center shadow-lg active:scale-95"
            style={{ elevation: 4 }}
          >
            <Text className="text-white font-bold text-base">
              {activeSlide < 3 ? 'Lanjut ➔' : 'Mulai Belajar Sekarang 🚀'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default OnboardingScreen;

