import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';
import { getColors } from '../utils/colors';
import { useTheme } from '../context/ThemeContext';

// Import your placeholder screens
import HomeScreen from '../screens/HomeScreen';
import PracticeMenuScreen from '../screens/PracticeMenuScreen';
import TypingPracticeScreen from '../screens/TypingPracticeScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  PracticeMenu: undefined;
  TypingPractice: { practiceFileName: string };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { theme } = useTheme();
  const Colors = getColors(theme);

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.surface,
        headerTitleStyle: {
          fontFamily: 'NanumBarunGothic',
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: '한글 타자 연습',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{ marginRight: 15 }}
            >
              <Text style={{ color: Colors.surface, fontSize: 24 }}>⚙️</Text> {/* Settings Icon */}
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="PracticeMenu" component={PracticeMenuScreen} options={{ title: '연습 메뉴' }} />
      <Stack.Screen name="TypingPractice" component={TypingPracticeScreen} options={{ title: '타자 연습' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '설정' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;