import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
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
  return (
    <Tab.Navigator
      initialRouteName="Beranda"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: styles.tabBar,
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
    height: Platform.OS === 'ios' ? 82 : 68,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});

