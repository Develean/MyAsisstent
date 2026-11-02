import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, Dimensions, Platform } from 'react-native';
import { CheckCircle2, Sparkles, Clock, AlertCircle } from 'lucide-react-native';

export type ToastType = 'success' | 'exp' | 'info' | 'warning';

interface ActionFeedbackToastProps {
  visible: boolean;
  message: string;
  subMessage?: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  topOffset?: number;
}

export const ActionFeedbackToast: React.FC<ActionFeedbackToastProps> = ({
  visible,
  message,
  subMessage,
  type = 'success',
  duration = 2400,
  onDismiss,
  topOffset = 50,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide down & fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: topOffset,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss timer
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -80,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onDismiss) onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
    }
  }, [visible, duration, onDismiss, topOffset, translateY, opacity]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'exp':
        return <Sparkles size={18} color="#D97706" />;
      case 'info':
        return <Clock size={18} color="#2563EB" />;
      case 'warning':
        return <AlertCircle size={18} color="#DC2626" />;
      case 'success':
      default:
        return <CheckCircle2 size={18} color="#059669" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'exp':
        return '#FDE68A';
      case 'info':
        return '#BFDBFE';
      case 'warning':
        return '#FECACA';
      case 'success':
      default:
        return '#A7F3D0';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'exp':
        return '#FFFBEB';
      case 'info':
        return '#EFF6FF';
      case 'warning':
        return '#FEF2F2';
      case 'success':
      default:
        return '#F0FDF4';
    }
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBgColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      <View style={styles.iconBox}>{getIcon()}</View>
      <View style={styles.textBox}>
        <Text style={styles.mainText} numberOfLines={1}>
          {message}
        </Text>
        {subMessage && (
          <Text style={styles.subText} numberOfLines={1}>
            {subMessage}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    maxWidth: '90%',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  iconBox: {
    marginRight: 10,
  },
  textBox: {
    flexShrink: 1,
  },
  mainText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1B33',
  },
  subText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
});

