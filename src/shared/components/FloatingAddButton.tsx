import React from 'react';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Tambah tugas atau jadwal baru"
      >
        <Plus color="#FFFFFF" size={28} strokeWidth={2.8} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    top: -18,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

