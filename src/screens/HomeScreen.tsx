import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getColors } from '../utils/colors';
import { useTheme } from '../context/ThemeContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.background,
      padding: 20,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 10,
      color: Colors.primary,
      fontFamily: 'NanumBarunGothic',
    },
    subtitle: {
      fontSize: 18,
      color: Colors.primaryLight,
      marginBottom: 40,
      fontFamily: 'NanumBarunGothic',
    },
    startButton: {
      backgroundColor: Colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 30,
      shadowColor: Colors.textPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    startButtonText: {
      color: Colors.surface,
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'NanumBarunGothic',
    },
  });

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>한글 타자 연습</Text>
      <Text style={themedStyles.subtitle}>앱에 오신 것을 환영합니다!</Text>
      <TouchableOpacity style={themedStyles.startButton} onPress={() => navigation.navigate('PracticeMenu')}>
        <Text style={themedStyles.startButtonText}>연습 시작</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
