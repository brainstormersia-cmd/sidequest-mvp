export type RecentMissionStatus = 'completed' | 'inProgress' | 'draft';

export interface RecentMissionCardProps {
  title: string;
  status: RecentMissionStatus;
  amount: string;
  categoryLabel: string;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
}
