import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { store, useAppSelector, useAppDispatch } from './src/store/store';
import { initDatabase } from './src/db/client';
import { LocalDataRepository } from './src/db/repository';
import { LocalNotificationService } from './src/shared/notifications/notificationService';
import { setTasks } from './src/features/tasks/taskSlice';
import { setSubjects, setSchedules, setExams } from './src/features/schedule/scheduleSlice';
import { OnboardingScreen } from './src/features/onboarding/OnboardingScreen';
import { BottomTabNavigator } from './src/shared/navigation/BottomTabNavigator';
import { QuickAddModal } from './src/shared/components/QuickAddModal';

const MainAppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const hasCompletedOnboarding = useAppSelector(
    (state) => state.user.hasCompletedOnboarding
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load persistent SQLite data into Redux on mount
  useEffect(() => {
    try {
      const subjects = LocalDataRepository.loadSubjects();
      const schedules = LocalDataRepository.loadSchedules();
      const tasks = LocalDataRepository.loadTasks();
      const exams = LocalDataRepository.loadExams();

      dispatch(setSubjects(subjects));
      dispatch(setSchedules(schedules));
      dispatch(setTasks(tasks));
      dispatch(setExams(exams));
    } catch (err) {
      console.warn('Failed to load initial data from SQLite:', err);
    }
  }, [dispatch]);

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer>
      <BottomTabNavigator onOpenAddModal={() => setIsModalVisible(true)} />
      <QuickAddModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </NavigationContainer>
  );
};

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        await LocalNotificationService.requestPermissions();
      } catch (err) {
        console.warn('Database initialization warning:', err);
      } finally {
        setIsDbReady(true);
      }
    }
    prepare();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <MainAppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
