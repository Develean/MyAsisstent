export interface ExamUrgencyConfig {
  daysLeft: number;
  mascotImage: any;
  tagColor: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  cardBg: string;
  subTextColor: string;
  btnBg: string;
  urgencyLabel: string;
}

/**
 * Returns dynamic theme colors and mascot emotion based on exam countdown distance
 */
export const getExamUrgencyConfig = (daysLeft: number): ExamUrgencyConfig => {
  if (daysLeft <= 1) {
    // 0 - 1 day remaining: Urgent / Critical (Red) -> Panicked / Tense Mascot
    return {
      daysLeft,
      mascotImage: require('../../../assets/sedih.png'),
      tagColor: '#DC2626',
      badgeBg: '#DC2626',
      badgeText: '#FFFFFF',
      cardBorder: '#FECACA',
      cardBg: '#FEF2F2',
      subTextColor: '#991B1B',
      btnBg: '#DC2626',
      urgencyLabel: daysLeft <= 0 ? 'Hari Ini!' : 'H-1 Besok!',
    };
  }

  if (daysLeft <= 3) {
    // 2 - 3 days remaining: Warning / Approaching (Amber) -> Focused Serious Mascot
    return {
      daysLeft,
      mascotImage: require('../../../assets/fokus.png'),
      tagColor: '#D97706',
      badgeBg: '#F59E0B',
      badgeText: '#FFFFFF',
      cardBorder: '#FDE68A',
      cardBg: '#FFFBEB',
      subTextColor: '#92400E',
      btnBg: '#D97706',
      urgencyLabel: `H-${daysLeft} (${daysLeft} Hari Lagi)`,
    };
  }

  if (daysLeft <= 7) {
    // 4 - 7 days remaining: Notice / 1 Week (Blue) -> Enthusiastic Semangat Mascot
    return {
      daysLeft,
      mascotImage: require('../../../assets/semangat.png'),
      tagColor: '#2563EB',
      badgeBg: '#2563EB',
      badgeText: '#FFFFFF',
      cardBorder: '#BFDBFE',
      cardBg: '#EFF6FF',
      subTextColor: '#1E40AF',
      btnBg: '#2563EB',
      urgencyLabel: `H-${daysLeft} (${daysLeft} Hari Lagi)`,
    };
  }

  // > 7 days remaining: Safe / Early prep (Emerald Green) -> Calm / Cheerful Senang Mascot
  return {
    daysLeft,
    mascotImage: require('../../../assets/senang.png'),
    tagColor: '#059669',
    badgeBg: '#10B981',
    badgeText: '#FFFFFF',
    cardBorder: '#A7F3D0',
    cardBg: '#ECFDF5',
    subTextColor: '#065F46',
    btnBg: '#059669',
    urgencyLabel: `H-${daysLeft} (${daysLeft} Hari Lagi)`,
  };
};
