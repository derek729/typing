export const lightColors = {
  primary: '#00796b',
  primaryLight: '#4db6ac',
  primaryDark: '#004d40',
  accent: '#ffc107',
  background: '#e0f7fa',
  surface: '#ffffff',
  textPrimary: '#212121',
  textSecondary: '#757575',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
  lightGray: '#f0f0f0',
  mediumGray: '#ccc',
  darkGray: '#333',
};

export const darkColors = {
  primary: '#4db6ac',
  primaryLight: '#80cbc4',
  primaryDark: '#004d40',
  accent: '#ffeb3b',
  background: '#212121',
  surface: '#424242',
  textPrimary: '#ffffff',
  textSecondary: '#bdbdbd',
  success: '#81c784',
  error: '#e57373',
  warning: '#ffeb3b',
  info: '#64b5f6',
  lightGray: '#424242',
  mediumGray: '#616161',
  darkGray: '#e0e0e0',
};

export type AppColors = typeof lightColors;

export const getColors = (theme: 'light' | 'dark'): AppColors => {
  return theme === 'light' ? lightColors : darkColors;
};
