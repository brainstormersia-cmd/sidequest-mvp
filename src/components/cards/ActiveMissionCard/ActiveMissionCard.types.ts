export type ActiveMissionRole = 'courier' | 'quester' | 'doer';

export interface ActiveMissionCardProps {
  role: ActiveMissionRole;
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
  playState?: 'playing' | 'paused';
  visible?: boolean;
  avatarInitials?: string;
  roadmap: Array<{
    id: string;
    label: string;
    status: 'completed' | 'upcoming';
  }>;
}
