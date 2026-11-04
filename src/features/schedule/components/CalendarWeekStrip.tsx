import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export interface CalendarDayItem {
  dateNum: number;
  dayShort: string;
  dayName: string;
  fullDateStr: string;
  hasDot: boolean;
  isToday?: boolean;
}

interface CalendarWeekStripProps {
  days: CalendarDayItem[];
  selectedDateNum: number;
  onSelectDay: (dayItem: CalendarDayItem) => void;
  selectedMonthIndex: number;
  selectedYear: number;
}

export const CalendarWeekStrip: React.FC<CalendarWeekStripProps> = ({
  days,
  selectedDateNum,
  onSelectDay,
  selectedMonthIndex,
  selectedYear,
}) => {
  const stripScrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  useEffect(() => {
    if (stripScrollViewRef.current) {
      // Each day card has width 52px + 8px gap = 60px
      // Keep selected day comfortably centered in view so surrounding days (e.g. Min 25) are not clipped
      const cardCenter = (selectedDateNum - 1) * 60 + 26;
      const targetX = Math.max(0, cardCenter - 160);
      const timer = setTimeout(() => {
        stripScrollViewRef.current?.scrollTo({ x: targetX, animated: true });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedDateNum, selectedMonthIndex, selectedYear]);

  return (
    <View style={styles.weekStripWrapper}>
      <ScrollView
        ref={stripScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekStripScrollContent}
      >
        {days.map((dayItem) => {
          const isActive = selectedDateNum === dayItem.dateNum;
          const isToday = !!dayItem.isToday;
          return (
            <TouchableOpacity
              key={dayItem.dateNum}
              style={[
                styles.stripCard,
                isToday && !isActive && styles.stripCardToday,
                isActive && styles.stripCardActive,
              ]}
              onPress={() => onSelectDay(dayItem)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.stripDayName,
                  isToday && !isActive && styles.stripDayNameToday,
                  isActive && styles.stripDayNameActive,
                ]}
              >
                {dayItem.dayShort}
              </Text>
              <Text
                style={[
                  styles.stripDateNum,
                  isToday && !isActive && styles.stripDateNumToday,
                  isActive && styles.stripDateNumActive,
                ]}
              >
                {dayItem.dateNum}
              </Text>
              {isActive ? (
                <View style={styles.activeWhiteDot} />
              ) : isToday ? (
                <View style={styles.todayBlueDot} />
              ) : dayItem.hasDot ? (
                <View style={styles.amberDot} />
              ) : (
                <View style={styles.dotPlaceholder} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  weekStripWrapper: {
    marginTop: 16,
    marginHorizontal: -20,
  },
  weekStripScrollContent: {
    paddingHorizontal: 24, // wider edge padding prevents first item clipping
    paddingVertical: 4,    // vertical room for card shadow
    flexDirection: 'row',
    gap: 8,
  },
  stripCard: {
    width: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stripCardActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  stripCardToday: {
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    backgroundColor: '#F0F7FF',
  },
  stripDayName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5670',
  },
  stripDayNameToday: {
    color: '#2563EB',
  },
  stripDayNameActive: {
    color: '#FFFFFF',
    opacity: 0.95,
  },
  stripDateNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
    marginTop: 2,
  },
  stripDateNumToday: {
    color: '#1D4ED8',
  },
  stripDateNumActive: {
    color: '#FFFFFF',
  },
  activeWhiteDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  todayBlueDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563EB',
    marginTop: 4,
  },
  amberDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B',
    marginTop: 4,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 4,
  },
});
