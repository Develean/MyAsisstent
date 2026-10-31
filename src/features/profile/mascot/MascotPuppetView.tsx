import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';

const BASE_WIDTH = 210;
const BASE_HEIGHT = 242;
const SCALE = BASE_WIDTH / 430; // 0.48837

// Quotes database for mascot dialogue
const QUOTES = [
  'Halo! 3 hari lagi ada PTS Matematika Wajib lho. Yuk cicil 1 sesi fokus!',
  'Semangat belajarnya hari ini! Jangan lupa minum air & istirahat ya 💧',
  'Streak 4 hari kamu keren banget! Jaga terus apinya jangan sampai padam 🔥',
  'Tinggal 350 EXP lagi nih buat naik ke Level 4! Mau cicil tugas bareng aku? ⭐',
  'Wah geli tahu disentuh-sentuh! Hehehe... Makasih ya, aku makin semangat! 🥰',
  'Kamu sudah tuntasin banyak tugas! Kalau penat, ambil jeda 5 menit dulu yuk ☕',
  'Psst... kalau rajin fokus sampai Level 5, aku bakal pakai kostum wisuda lho! 🎓',
];

interface MascotPuppetViewProps {
  onExpReward?: (exp: number) => void;
}

export const MascotPuppetView: React.FC<MascotPuppetViewProps> = ({ onExpReward }) => {
  const [speechText, setSpeechText] = useState(QUOTES[0]);
  const [mood, setMood] = useState<'normal' | 'happy' | 'sparkle'>('normal');
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthState, setMouthState] = useState<'smile' | 'open' | 'o'>('smile');
  const [tapCount, setTapCount] = useState(0);

  // Animated values
  const scaleY = useRef(new Animated.Value(1)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const blushOpacity = useRef(new Animated.Value(0)).current;
  const lookX = useRef(new Animated.Value(0)).current;
  const lookY = useRef(new Animated.Value(0)).current;
  const speechBubbleOpacity = useRef(new Animated.Value(1)).current;

  // Natural Organic Eye Blinking Loop
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const scheduleNextBlink = () => {
      const delay = 3000 + Math.random() * 2500;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          // 20% double-blink chance
          if (Math.random() < 0.2) {
            setTimeout(() => {
              setIsBlinking(true);
              setTimeout(() => setIsBlinking(false), 120);
            }, 180);
          }
          scheduleNextBlink();
        }, 130);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // PanResponder for smooth gaze tracking
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const maxRadius = 4.0;
        const dx = gesture.dx * 0.08;
        const dy = gesture.dy * 0.08;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const factor = Math.min(dist, maxRadius);
          lookX.setValue((dx / dist) * factor);
          lookY.setValue((dy / dist) * factor * 0.65);
        }
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(lookX, { toValue: 0, useNativeDriver: true, tension: 40, friction: 6 }),
          Animated.spring(lookY, { toValue: 0, useNativeDriver: true, tension: 40, friction: 6 }),
        ]).start();
      },
    })
  ).current;

  // Tap mascot interaction: Squash & stretch, blush pulse, lip-sync, quote change
  const handleTap = () => {
    // 1. Squash & Stretch spring
    scaleY.setValue(0.85);
    scaleX.setValue(1.15);
    Animated.parallel([
      Animated.spring(scaleY, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
      Animated.spring(scaleX, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
    ]).start();

    // 2. Pulse Blush cheeks
    Animated.sequence([
      Animated.timing(blushOpacity, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(blushOpacity, { toValue: 0.0, duration: 300, useNativeDriver: true }),
    ]).start();

    // 3. Switch mood
    const nextMood = Math.random() > 0.4 ? 'sparkle' : 'happy';
    setMood(nextMood);
    setTimeout(() => setMood('normal'), 1800);

    // 4. Talking Lip-Sync simulation
    let step = 0;
    const talkInterval = setInterval(() => {
      step++;
      if (step % 3 === 0) setMouthState('open');
      else if (step % 3 === 1) setMouthState('o');
      else setMouthState('smile');

      if (step > 9) {
        clearInterval(talkInterval);
        setMouthState('smile');
      }
    }, 140);

    // 5. Speech Bubble rotate
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    const nextQuote = QUOTES[nextCount % QUOTES.length];

    Animated.sequence([
      Animated.timing(speechBubbleOpacity, { toValue: 0.3, duration: 80, useNativeDriver: true }),
      Animated.timing(speechBubbleOpacity, { toValue: 1.0, duration: 150, useNativeDriver: true }),
    ]).start();
    setSpeechText(nextQuote);

    // 6. Gamification EXP reward every 3 taps
    if (nextCount % 3 === 0 && onExpReward) {
      onExpReward(5);
    }
  };

  // Calibrated positions scaled from 430x496
  // True Eye Centers from Master Art: (158.0, 137.0) and (272.5, 137.0)
  const leftEyeX = 158.0 * SCALE;
  const rightEyeX = 272.5 * SCALE;
  const eyesY = 137.0 * SCALE;

  // Mouth: (214.5, 183.0)
  const mouthX = 214.5 * SCALE;
  const mouthY = 183.0 * SCALE;

  // Cheeks: outer lower fluff at (95.0, 175.0) and (335.0, 175.0)
  const leftCheekX = 95.0 * SCALE;
  const rightCheekX = 335.0 * SCALE;
  const cheeksY = 175.0 * SCALE;

  // Eye dimensions scaled (31x44 natural size)
  const eyeW = 31 * SCALE;
  const eyeH = 44 * SCALE;

  // Mouth dimensions scaled
  const mouthW = 193 * 0.36 * SCALE;
  const mouthH = 86 * 0.36 * SCALE;

  // Cheek dimensions scaled
  const cheekW = 165 * 0.22 * SCALE;
  const cheekH = 95 * 0.22 * SCALE;

  // Render eye assets based on state
  const renderEyes = () => {
    if (isBlinking) {
      return (
        <>
          <Image
            source={require('../../../../assets/bagian_maskot/bagian/mata_tutup_kiri.png')}
            style={[styles.absolutePart, { left: leftEyeX - eyeW / 2, top: eyesY - eyeH / 2 + 2, width: eyeW, height: eyeH * 0.45 }]}
            resizeMode="contain"
          />
          <Image
            source={require('../../../../assets/bagian_maskot/bagian/mata_tutup_kanan.png')}
            style={[styles.absolutePart, { left: rightEyeX - eyeW / 2, top: eyesY - eyeH / 2 + 2, width: eyeW, height: eyeH * 0.45 }]}
            resizeMode="contain"
          />
        </>
      );
    }

    if (mood === 'sparkle') {
      return (
        <Animated.View style={[styles.eyeWrapper, { transform: [{ translateX: lookX }, { translateY: lookY }] }]}>
          <Image
            source={require('../../../../assets/bagian_maskot/bagian/mata_berkilau_kiri.png')}
            style={[styles.absolutePart, { left: leftEyeX - eyeW / 2, top: eyesY - eyeH / 2, width: eyeW, height: eyeH }]}
            resizeMode="contain"
          />
          <Image
            source={require('../../../../assets/bagian_maskot/bagian/mata_berkilau_kanan.png')}
            style={[styles.absolutePart, { left: rightEyeX - eyeW / 2, top: eyesY - eyeH / 2, width: eyeW, height: eyeH }]}
            resizeMode="contain"
          />
        </Animated.View>
      );
    }

    if (mood === 'happy') {
      return (
        <>
          <Image
            source={require('../../../../assets/bagian_maskot/bagian/mata_senyum_kiri.png')}
            style={[styles.absolutePart, { left: leftEyeX - eyeW / 2, top: eyesY - eyeH / 2, width: eyeW, height: eyeH * 0.6 }]}
            resizeMode="contain"
          />
          <Image
            source={require('../../../../assets/bagian_maskot/bagian/mata_senyum_kanan.png')}
            style={[styles.absolutePart, { left: rightEyeX - eyeW / 2, top: eyesY - eyeH / 2, width: eyeW, height: eyeH * 0.6 }]}
            resizeMode="contain"
          />
        </>
      );
    }

    // Default Normal Open Eyes with Gaze Tracking
    return (
      <Animated.View style={[styles.eyeWrapper, { transform: [{ translateX: lookX }, { translateY: lookY }] }]}>
        <Image
          source={require('../../../../assets/bagian_maskot/bagian/mata_kiri.png')}
          style={[styles.absolutePart, { left: leftEyeX - eyeW / 2, top: eyesY - eyeH / 2, width: eyeW, height: eyeH }]}
          resizeMode="contain"
        />
        <Image
          source={require('../../../../assets/bagian_maskot/bagian/mata_kanan.png')}
          style={[styles.absolutePart, { left: rightEyeX - eyeW / 2, top: eyesY - eyeH / 2, width: eyeW, height: eyeH }]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  // Render mouth based on state
  const renderMouth = () => {
    if (mouthState === 'open') {
      return (
        <Image
          source={require('../../../../assets/bagian_maskot/bagian/mulut_terbuka.png')}
          style={[styles.absolutePart, { left: mouthX - mouthW * 0.55, top: mouthY - mouthH * 0.3, width: mouthW * 1.1, height: mouthH * 1.1 }]}
          resizeMode="contain"
        />
      );
    }
    if (mouthState === 'o') {
      return (
        <Image
          source={require('../../../../assets/bagian_maskot/bagian/mulut_o.png')}
          style={[styles.absolutePart, { left: mouthX - mouthW * 0.45, top: mouthY - mouthH * 0.3, width: mouthW * 0.9, height: mouthH * 1.1 }]}
          resizeMode="contain"
        />
      );
    }
    return (
      <Image
        source={require('../../../../assets/bagian_maskot/bagian/mulut_senyum.png')}
        style={[styles.absolutePart, { left: mouthX - mouthW / 2, top: mouthY - mouthH / 2, width: mouthW, height: mouthH }]}
        resizeMode="contain"
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Speech Bubble from Mascot */}
      <Animated.View style={[styles.speechBubble, { opacity: speechBubbleOpacity }]}>
        <Text style={styles.speechBubbleText}>"{speechText}"</Text>
        <View style={styles.speechBubbleTail} />
      </Animated.View>

      {/* Mascot Puppet Container with Spring & Touch Tracking */}
      <TouchableOpacity activeOpacity={0.95} onPress={handleTap} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.puppetFrame,
            {
              transform: [
                { scaleX },
                { scaleY },
              ],
            },
          ]}
        >
          {/* Layer 1: Pristine Clean Base Body & Head (100% Zero-Artifact) */}
          <Image
            source={require('../../../../assets/mascot_pristine_clean_base.png')}
            style={styles.baseImage}
            resizeMode="contain"
          />

          {/* Layer 2: Emotional Blush Cheeks (fades in only when tapped) */}
          <Animated.View style={[styles.cheekWrapper, { opacity: blushOpacity }]}>
            <Image
              source={require('../../../../assets/bagian_maskot/bagian/pipi_kiri.png')}
              style={[styles.absolutePart, { left: leftCheekX - cheekW / 2, top: cheeksY - cheekH / 2, width: cheekW, height: cheekH }]}
              resizeMode="contain"
            />
            <Image
              source={require('../../../../assets/bagian_maskot/bagian/pipi_kanan.png')}
              style={[styles.absolutePart, { left: rightCheekX - cheekW / 2, top: cheeksY - cheekH / 2, width: cheekW, height: cheekH }]}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Layer 3: Eyes with 60FPS Gaze Tracking & Natural Blinking */}
          {renderEyes()}

          {/* Layer 4: Mouth with Lip-Sync & Smile */}
          {renderMouth()}
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.hintBadge}>
        <Text style={styles.hintText}>✨ Sentuh / Geser untuk interaksi!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  speechBubble: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    maxWidth: '92%',
    position: 'relative',
  },
  speechBubbleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    backgroundColor: '#EFF6FF',
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#BFDBFE',
    transform: [{ rotate: '45deg' }],
  },
  puppetFrame: {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseImage: {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
  },
  absolutePart: {
    position: 'absolute',
  },
  eyeWrapper: {
    ...StyleSheet.absoluteFill,
  },
  cheekWrapper: {
    ...StyleSheet.absoluteFill,
  },
  hintBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 8,
  },
  hintText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
});

