import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { getColors } from '../utils/colors';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const Colors = getColors(theme);

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: Colors.background,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 10,
      color: Colors.textPrimary,
      fontFamily: 'NanumBarunGothic',
    },
    subtitle: {
      fontSize: 16,
      color: Colors.textSecondary,
      marginBottom: 30,
      fontFamily: 'NanumBarunGothic',
    },
    settingItem: {
      width: '100%',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors.mediumGray,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingText: {
      fontSize: 18,
      color: Colors.textPrimary,
      fontFamily: 'NanumBarunGothic',
    },
  });

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>설정</Text>
      <Text style={themedStyles.subtitle}>앱 설정을 변경할 수 있습니다.</Text>
      <View style={themedStyles.settingItem}>
        <Text style={themedStyles.settingText}>다크 모드</Text>
        <Switch
          trackColor={{ false: Colors.mediumGray, true: Colors.primaryLight }}
          thumbColor={theme === 'dark' ? Colors.primary : Colors.surface}
          ios_backgroundColor={Colors.mediumGray}
          onValueChange={toggleTheme}
          value={theme === 'dark'}
        />
      </View>
      <View style={themedStyles.settingItem}>
        <Text style={themedStyles.settingText}>글꼴 크기</Text>
        {/* Font size selection component will go here */}
      </View>
    </View>
  );
};

export default SettingsScreen;
