import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface TimerRingProps {
  timeString: string;
  durationMinutes: number;
  isRunning: boolean;
  strokeDashoffset: number;
  circumference: number;
  pulseAnim: Animated.Value;
}

export const TimerRing: React.FC<TimerRingProps> = ({
  timeString,
  durationMinutes,
  isRunning,
  strokeDashoffset,
  circumference,
  pulseAnim,
}) => {
  const animatedOffset = useRef(new Animated.Value(strokeDashoffset)).current;
  const [currentDisplayOffset, setCurrentDisplayOffset] = useState(strokeDashoffset);

  useEffect(() => {
    const listenerId = animatedOffset.addListener(({ value }) => {
      setCurrentDisplayOffset(value);
    });
    return () => {
      animatedOffset.removeListener(listenerId);
    };
  }, [animatedOffset]);

  useEffect(() => {
    Animated.timing(animatedOffset, {
      toValue: strokeDashoffset,
      duration: isRunning ? 950 : 350,
      useNativeDriver: false,
    }).start();
  }, [strokeDashoffset, isRunning, animatedOffset]);

  return (
    <Animated.View
      style={[
        styles.timerRingContainer,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {isRunning && <View style={styles.timerPulsingHalo} />}
      <Svg width={240} height={240} viewBox="0 0 240 240" style={styles.timerSvg}>
        {/* Background Track Circle */}
        <Circle
          cx={120}
          cy={120}
          r={100}
          stroke="#DCE5F2"
          strokeWidth={16}
          fill="none"
        />
        {/* Blue Progress Stroke with Smooth Animated Interpolation */}
        <Circle
          cx={120}
          cy={120}
          r={100}
          stroke="#2563EB"
          strokeWidth={16}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={currentDisplayOffset}
          strokeLinecap="round"
          transform="rotate(-90 120 120)"
        />
      </Svg>
      <View style={styles.timerCenterTextContainer}>
        <Text style={styles.timerDigits}>{timeString}</Text>
        <Text style={styles.timerSubLabel}>
          dari {durationMinutes || 25} menit
        </Text>
        {isRunning ? (
          <View style={styles.timerRunningIndicator}>
            <View style={styles.timerRunningDot} />
            <Text style={styles.timerRunningText}>Sedang Berjalan</Text>
          </View>
        ) : (
          <View style={styles.timerPausedIndicator}>
            <Text style={styles.timerPausedText}>Siap Belajar</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  timerRingContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
    alignSelf: 'center',
  },
  timerPulsingHalo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#DBEAFE',
    opacity: 0.45,
  },
  timerSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerCenterTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDigits: {
    fontSize: 44,
    fontWeight: '900',
    color: '#0F1B33',
    letterSpacing: -1,
  },
  timerSubLabel: {
    fontSize: 13,
    color: '#4A5670',
    fontWeight: '600',
    marginTop: 2,
  },
  timerRunningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 8,
  },
  timerRunningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  timerRunningText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  timerPausedIndicator: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 8,
  },
  timerPausedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
