import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useAppSelector, RootState } from '../../../store/store';
import Svg, {
  G,
  Path,
  Ellipse,
  Image as SvgImage,
  Defs,
  ClipPath,
  Text as SvgText,
} from 'react-native-svg';

export type MascotMood = 'normal' | 'happy' | 'sparkle' | 'surprised' | 'sad' | 'sleep';

interface MascotStateConfig {
  eyes: 'open' | 'happy' | 'wide' | 'sleep';
  mouth: 'smile' | 'open' | 'o' | 'sad' | 'tiny';
  brows: 'normal' | 'up' | 'sad' | 'down';
  fx: '' | 'blush' | 'sparkle';
}

const MOOD_CONFIGS: Record<MascotMood, MascotStateConfig> = {
  normal: { eyes: 'open', mouth: 'smile', brows: 'normal', fx: '' },
  happy: { eyes: 'happy', mouth: 'open', brows: 'normal', fx: 'blush' },
  sparkle: { eyes: 'open', mouth: 'open', brows: 'up', fx: 'sparkle' },
  surprised: { eyes: 'wide', mouth: 'o', brows: 'up', fx: '' },
  sad: { eyes: 'open', mouth: 'sad', brows: 'sad', fx: '' },
  sleep: { eyes: 'sleep', mouth: 'tiny', brows: 'down', fx: '' },
};

interface MascotPuppetViewProps {
  onExpReward?: (exp: number) => void;
}

export const MascotPuppetView: React.FC<MascotPuppetViewProps> = ({ onExpReward }) => {
  const user = useAppSelector((state: RootState) => state.user);
  const exams = useAppSelector((state: RootState) => state.schedule.exams);
  const tasks = useAppSelector((state: RootState) => state.tasks.tasks);

  const nearestExam = exams.length > 0 ? exams[0] : null;
  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;
  const expToNextLevel = Math.max(0, user.maxExp - user.currentExp);

  const dynamicQuotes = useMemo(() => {
    const list: string[] = [];

    // Contextual exam quote
    if (nearestExam) {
      list.push(`Halo ${user.name || 'teman'}! ${nearestExam.daysLeft} hari lagi ada ujian "${nearestExam.title}" lho. Yuk cicil 1 sesi fokus!`);
    } else {
      list.push(`Halo ${user.name || 'teman'}! Semua jadwal ujianmu aman. Yuk pertahankan fokus belajar hari ini!`);
    }

    // Contextual streak quote
    if (user.streakDays && user.streakDays > 0) {
      list.push(`Streak ${user.streakDays} hari kamu keren banget! Jaga terus konsistensinya ya!`);
    } else {
      list.push('Yuk mulai streak belajarmu hari ini dengan menyelesaikan 1 sesi fokus!');
    }

    // Contextual EXP & Level quote
    list.push(`Tinggal ${expToNextLevel} EXP lagi nih buat naik ke Level ${user.currentLevel + 1}! Mau cicil tugas bareng aku?`);

    // Contextual task quote
    if (pendingTasksCount > 0) {
      list.push(`Ada ${pendingTasksCount} tugas yang masih menunggumu. Mau kita selesaikan satu per satu?`);
    } else {
      list.push('Hebat! Semua tugas aktif sudah tuntas. Saatnya istirahat atau pelajari materi baru.');
    }

    list.push('Wah geli tahu disentuh-sentuh! Hehehe... Makasih ya, aku makin semangat!');
    list.push('Semangat belajarnya hari ini! Jangan lupa minum air & istirahat ya.');

    return list;
  }, [user.name, user.streakDays, user.currentLevel, user.maxExp, expToNextLevel, nearestExam, pendingTasksCount]);

  const [currentMood, setCurrentMood] = useState<MascotMood>('normal');
  const [speechText, setSpeechText] = useState(dynamicQuotes[0]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [talkingMouth, setTalkingMouth] = useState<'smile' | 'open' | 'o' | null>(null);
  const [tapCount, setTapCount] = useState(0);

  // Sync initial quote when dynamicQuotes change
  useEffect(() => {
    setSpeechText(dynamicQuotes[tapCount % dynamicQuotes.length]);
  }, [dynamicQuotes]);

  // Animation values
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const eyeLookX = useRef(new Animated.Value(0)).current;
  const eyeLookY = useRef(new Animated.Value(0)).current;
  const speechBubbleOpacity = useRef(new Animated.Value(1)).current;

  // Natural organic blinking loop
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;

    const scheduleNextBlink = () => {
      const delay = 2200 + Math.random() * 3000;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          // 25% double-blink chance like in Maskot Hidup
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setIsBlinking(true);
              setTimeout(() => setIsBlinking(false), 120);
            }, 180);
          }
          scheduleNextBlink();
        }, 160);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // PanResponder for interactive gaze tracking
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const maxDist = 12.0;
        const dx = gesture.dx * 0.12;
        const dy = gesture.dy * 0.12;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const factor = Math.min(dist, maxDist);
          eyeLookX.setValue((dx / dist) * factor);
          eyeLookY.setValue((dy / dist) * factor * 0.65);
        }
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(eyeLookX, { toValue: 0, useNativeDriver: true, tension: 40, friction: 6 }),
          Animated.spring(eyeLookY, { toValue: 0, useNativeDriver: true, tension: 40, friction: 6 }),
        ]).start();
      },
    })
  ).current;

  // Jump animation for happy/sparkle (matching Maskot Hidup keyframes)
  const triggerJumpAnim = () => {
    Animated.sequence([
      Animated.timing(scaleY, { toValue: 0.94, duration: 100, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(translateY, { toValue: -22, duration: 250, useNativeDriver: true }),
        Animated.timing(scaleY, { toValue: 1.06, duration: 250, useNativeDriver: true }),
        Animated.timing(scaleX, { toValue: 0.94, duration: 250, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(scaleY, { toValue: 0.94, duration: 220, useNativeDriver: true }),
        Animated.timing(scaleX, { toValue: 1.06, duration: 220, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.spring(scaleY, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.spring(scaleX, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      ]),
    ]).start();
  };

  // Squish animation on tap
  const triggerSquishAnim = () => {
    scaleY.setValue(0.88);
    scaleX.setValue(1.12);
    Animated.parallel([
      Animated.spring(scaleY, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      Animated.spring(scaleX, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]).start();
  };

  // Switch mood
  const handleSelectMood = (mood: MascotMood) => {
    setCurrentMood(mood);
    if (mood === 'happy' || mood === 'sparkle') {
      triggerJumpAnim();
    } else {
      triggerSquishAnim();
    }
  };

  // Tap interaction
  const handleTapMascot = () => {
    triggerSquishAnim();

    // Random cheerful mood on tap
    const tappedMood = Math.random() > 0.4 ? 'happy' : 'sparkle';
    setCurrentMood(tappedMood);
    setTimeout(() => setCurrentMood('normal'), 2000);

    // Talking lip-sync loop
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const mouthCycle: ('open' | 'smile' | 'o')[] = ['open', 'smile', 'open', 'o', 'smile'];
      setTalkingMouth(mouthCycle[step % mouthCycle.length]);
      if (step > 8) {
        clearInterval(interval);
        setTalkingMouth(null);
      }
    }, 140);

    // Rotate speech quote
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    const nextQuote = dynamicQuotes[nextCount % dynamicQuotes.length];

    Animated.sequence([
      Animated.timing(speechBubbleOpacity, { toValue: 0.3, duration: 80, useNativeDriver: true }),
      Animated.timing(speechBubbleOpacity, { toValue: 1.0, duration: 150, useNativeDriver: true }),
    ]).start();
    setSpeechText(nextQuote);

    // Gamification reward: +5 EXP every 3 taps
    if (nextCount % 3 === 0 && onExpReward) {
      onExpReward(5);
    }
  };

  const cfg = MOOD_CONFIGS[currentMood];
  const activeMouth = talkingMouth || cfg.mouth;

  // Eyebrow transform
  let browTransformL = 'translate(0, 0)';
  let browTransformR = 'translate(0, 0)';
  if (cfg.brows === 'up') {
    browTransformL = 'translate(0, -16)';
    browTransformR = 'translate(0, -16)';
  } else if (cfg.brows === 'down') {
    browTransformL = 'translate(0, 6)';
    browTransformR = 'translate(0, 6)';
  } else if (cfg.brows === 'sad') {
    browTransformL = 'rotate(-20, 218, 120) translate(0, 4)';
    browTransformR = 'rotate(20, 409, 120) translate(0, 4)';
  }

  // Eye open / blink / wide scale
  const eyeBlinkScaleY = isBlinking ? 0.05 : 1.0;
  const eyeWideScale = cfg.eyes === 'wide' ? 1.1 : 1.0;

  return (
    <View style={styles.container}>
      {/* 1. Speech Bubble Dialogue */}
      <Animated.View style={[styles.speechBubble, { opacity: speechBubbleOpacity }]}>
        <Text style={styles.speechBubbleText}>"{speechText}"</Text>
        <View style={styles.speechBubbleTail} />
      </Animated.View>

      {/* 2. Interactive Maskot Hidup Puppet Stage */}
      <TouchableOpacity
        activeOpacity={0.96}
        onPress={handleTapMascot}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.puppetWrapper,
            {
              transform: [
                { translateY },
                { scaleX },
                { scaleY },
              ],
            },
          ]}
        >
          <Svg
            width={230}
            height={263}
            viewBox="0 0 635 725"
            style={styles.svgPuppet}
          >
            <Defs>
              <ClipPath id="mclip">
                <Path d="M281,252 Q316,246 351,252 Q349,292 316,297 Q283,292 281,252Z" />
              </ClipPath>
            </Defs>

            {/* Layer 1: Body & Head Base (100% Clean) */}
            <SvgImage
              x={0}
              y={0}
              width={635}
              height={725}
              href={require('../../../../assets/bagian_maskot/hidup/badan_bersih.png')}
            />

            {/* Layer 2: Eyebrows with Emotional Transforms */}
            <G id="brows">
              <G transform={browTransformL}>
                <SvgImage
                  x={193}
                  y={104}
                  width={51}
                  height={32}
                  href={require('../../../../assets/bagian_maskot/hidup/alis_kiri.png')}
                />
              </G>
              <G transform={browTransformR}>
                <SvgImage
                  x={384}
                  y={104}
                  width={50}
                  height={32}
                  href={require('../../../../assets/bagian_maskot/hidup/alis_kanan.png')}
                />
              </G>
            </G>

            {/* Layer 3: Eyes (Open / Blinking / Happy Arcs / Sleep Arcs) */}
            {cfg.eyes === 'happy' ? (
              <G id="arcHappy">
                <Path
                  d="M191,209 Q223,171 255,209"
                  stroke="#673A40"
                  strokeWidth={13}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M372,208 Q404,170 436,208"
                  stroke="#673A40"
                  strokeWidth={13}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            ) : cfg.eyes === 'sleep' ? (
              <G id="arcSleep">
                <Path
                  d="M191,191 Q223,221 255,191"
                  stroke="#673A40"
                  strokeWidth={13}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M372,190 Q404,220 436,190"
                  stroke="#673A40"
                  strokeWidth={13}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            ) : (
              <G id="eyes">
                {/* Left Eye */}
                <G
                  transform={`translate(223, 199) scale(${eyeWideScale}, ${eyeWideScale * eyeBlinkScaleY}) translate(-223, -199)`}
                >
                  <SvgImage
                    x={182}
                    y={152}
                    width={82}
                    height={94}
                    href={require('../../../../assets/bagian_maskot/hidup/mata_kiri.png')}
                  />
                </G>
                {/* Right Eye */}
                <G
                  transform={`translate(404, 198) scale(${eyeWideScale}, ${eyeWideScale * eyeBlinkScaleY}) translate(-404, -198)`}
                >
                  <SvgImage
                    x={363}
                    y={152}
                    width={82}
                    height={93}
                    href={require('../../../../assets/bagian_maskot/hidup/mata_kanan.png')}
                  />
                </G>
              </G>
            )}

            {/* Sparkles FX (Golden 4-point stars) */}
            {cfg.fx === 'sparkle' && (
              <G id="fxSparkle" fill="#F5B83D">
                <G transform="translate(233, 204)">
                  <Path d="M0,-20 Q3,-4 20,0 Q3,4 0,20 Q-3,4 -20,0 Q-3,-4 0,-20Z" />
                </G>
                <G transform="translate(397, 204)">
                  <Path d="M0,-20 Q3,-4 20,0 Q3,4 0,20 Q-3,4 -20,0 Q-3,-4 0,-20Z" />
                </G>
                <G transform="translate(246, 222) scale(.4)">
                  <Path d="M0,-20 Q3,-4 20,0 Q3,4 0,20 Q-3,4 -20,0 Q-3,-4 0,-20Z" />
                </G>
                <G transform="translate(410, 222) scale(.4)">
                  <Path d="M0,-20 Q3,-4 20,0 Q3,4 0,20 Q-3,4 -20,0 Q-3,-4 0,-20Z" />
                </G>
              </G>
            )}

            {/* Blush Cheeks (Pink Swells) */}
            {cfg.fx === 'blush' && (
              <G id="blush" fill="#FF9FB0" opacity={0.75}>
                <Ellipse cx={168} cy={262} rx={26} ry={14} />
                <Ellipse cx={462} cy={262} rx={26} ry={14} />
              </G>
            )}

            {/* Floating Sleep Zzz's */}
            {currentMood === 'sleep' && (
              <G id="zzz" fill="#7FA9E8" fontWeight="bold">
                <SvgText x={470} y={150} fontSize={32}>Z</SvgText>
                <SvgText x={500} y={120} fontSize={28}>z</SvgText>
                <SvgText x={524} y={96} fontSize={22}>z</SvgText>
              </G>
            )}

            {/* Layer 4: Nose */}
            <SvgImage
              x={292}
              y={213}
              width={51}
              height={39}
              href={require('../../../../assets/bagian_maskot/hidup/hidung.png')}
            />

            {/* Layer 5: Mouth States */}
            {activeMouth === 'open' ? (
              <G id="mOpen">
                <Path
                  d="M281,252 Q316,246 351,252 Q349,292 316,297 Q283,292 281,252Z"
                  fill="#4A2328"
                  stroke="#4A2328"
                  strokeWidth={8}
                  strokeLinejoin="round"
                />
                <Ellipse
                  cx={316}
                  cy={292}
                  rx={24}
                  ry={12}
                  fill="#FF9AA2"
                  clipPath="url(#mclip)"
                />
              </G>
            ) : activeMouth === 'o' ? (
              <G id="mO">
                <Ellipse cx={316} cy={268} rx={15} ry={19} fill="#4A2328" />
              </G>
            ) : activeMouth === 'sad' ? (
              <G id="mSad">
                <Path
                  d="M286,280 Q316,252 346,280"
                  fill="none"
                  stroke="#673A40"
                  strokeWidth={12}
                  strokeLinecap="round"
                />
              </G>
            ) : activeMouth === 'tiny' ? (
              <G id="mTiny">
                <Ellipse cx={316} cy={264} rx={9} ry={7} fill="#4A2328" />
              </G>
            ) : (
              <G id="mSmile">
                <SvgImage
                  x={258}
                  y={242}
                  width={112}
                  height={51}
                  href={require('../../../../assets/bagian_maskot/hidup/mulut_senyum.png')}
                />
              </G>
            )}
          </Svg>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  speechBubble: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    width: '92%',
    alignSelf: 'center',
    position: 'relative',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  speechBubbleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 19,
    flexWrap: 'wrap',
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: '#EFF6FF',
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#BFDBFE',
    transform: [{ rotate: '45deg' }],
  },
  puppetWrapper: {
    width: 230,
    height: 263,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgPuppet: {
    overflow: 'visible',
  },
});
