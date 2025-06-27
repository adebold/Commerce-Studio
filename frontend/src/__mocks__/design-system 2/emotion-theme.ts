export interface EmotionTheme {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export function createEmotionTheme(mode: 'light' | 'dark' = 'light'): EmotionTheme {
  return {
    mode,
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      background: mode === 'light' ? '#ffffff' : '#121212',
      text: mode === 'light' ? '#000000' : '#ffffff',
    },
  };
}