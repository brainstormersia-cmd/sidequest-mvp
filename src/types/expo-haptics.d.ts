declare module 'expo-haptics' {
  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
  }

  export enum ImpactFeedbackStyle {
    Light = 'light',
    Medium = 'medium',
    Heavy = 'heavy',
    Soft = 'soft',
    Rigid = 'rigid',
  }

  export const selectionAsync: () => Promise<void>;
  export const notificationAsync: (type: NotificationFeedbackType) => Promise<void>;
  export const impactAsync: (style?: ImpactFeedbackStyle) => Promise<void>;
}
