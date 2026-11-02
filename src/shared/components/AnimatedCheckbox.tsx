import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';

interface AnimatedCheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onPress,
  size = 22,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Bounce spring animation on checked state change
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.75,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checked, scaleAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size / 3.5),
            backgroundColor: checked ? '#2563EB' : '#F1F5F9',
            borderColor: checked ? '#2563EB' : '#CBD5E1',
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        {checked && <Check size={Math.round(size * 0.65)} color="#FFFFFF" strokeWidth={3} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
