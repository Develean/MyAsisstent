import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../../features/home/HomeScreen';
import { ScheduleScreen } from '../../features/schedule/ScheduleScreen';
import { FocusScreen } from '../../features/focus/FocusScreen';
import { ProfileScreen } from '../../features/profile/ProfileScreen';
import { FloatingAddButton } from '../components/FloatingAddButton';
import { Home, Calendar, Clock, User } from 'lucide-react-native';

export type RootTabParamList = {
  Beranda: undefined;
  Jadwal: undefined;
  TambahPlaceholder: undefined;
  Fokus: undefined;
  Profil: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Empty component for the center add button placeholder
const DummyAddScreen = () => <View style={{ flex: 1, backgroundColor: '#F8FAFC' }} />;

interface BottomTabNavigatorProps {
  onOpenAddModal: () => void;
}

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({ onOpenAddModal }) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 8);

  return (
    <Tab.Navigator
      initialRouteName="Beranda"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#5B6678',
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Beranda"
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
        }}
      >
        {(props) => (
          <HomeScreen
            {...props}
            onOpenAddModal={onOpenAddModal}
            onNavigateTab={(tab) => props.navigation.navigate(tab as any)}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Jadwal"
        options={{
          tabBarLabel: 'Jadwal',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={22} />,
        }}
      >
        {(props) => <ScheduleScreen {...props} onOpenAddSubjectModal={onOpenAddModal} />}
      </Tab.Screen>

      {/* Floating Center Add Button */}
      <Tab.Screen
        name="TambahPlaceholder"
        component={DummyAddScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => <FloatingAddButton onPress={onOpenAddModal} />,
        }}
      />

      <Tab.Screen
        name="Fokus"
        component={FocusScreen}
        options={{
          tabBarLabel: 'Fokus',
          tabBarIcon: ({ color, size }) => <Clock color={color} size={22} />,
        }}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 84 : 76,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});

