export interface ActiveMissionCardProps {
  etaLabel: string;
  etaSubLabel?: string;
  etaTone?: 'success' | 'warning' | 'review';
  statusLabel: string;
  statusTone?: 'success' | 'warning' | 'review' | 'muted';
  title: string;
  subtitle: string;
  progress: number;
  progressLabel?: string;
  onPress?: () => void;
  onPressChat?: () => void;
  avatarInitials?: string;
}
