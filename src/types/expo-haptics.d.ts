declare module 'expo-haptics' {
  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
  }

  export const selectionAsync: () => Promise<void>;
  export const notificationAsync: (type: NotificationFeedbackType) => Promise<void>;
}
