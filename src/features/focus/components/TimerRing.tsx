import React from 'react';
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
        {/* Blue Progress Stroke */}
        <Circle
          cx={120}
          cy={120}
          r={100}
          stroke="#2563EB"
          strokeWidth={16}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
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
    alignSelf: 'center',
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerPulsingHalo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#EFF6FF',
    opacity: 0.6,
  },
  timerSvg: {
    position: 'absolute',
  },
  timerCenterTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDigits: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0F1B33',
    letterSpacing: -1,
  },
  timerSubLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  timerRunningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
    gap: 5,
  },
  timerRunningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  timerRunningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  timerPausedIndicator: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  timerPausedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
});
