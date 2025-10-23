export interface NewMissionTip {
  id: string;
  copy: string;
}

export interface NewMissionPromptCardProps {
  title: string;
  subtitle: string;
  illustration?: string;
  tips: NewMissionTip[];
  ctaLabel: string;
  onPressCta: () => void;
}
