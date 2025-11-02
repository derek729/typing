import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getColors } from '../utils/colors';
import { useTheme } from '../context/ThemeContext';

type PracticeMenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PracticeMenu'>;

const practiceFiles = [
  { id: '1', name: '기니_과일.json', title: '기니 - 과일 연습' },
  { id: '2', name: '라니_숫자.json', title: '라니 - 숫자 연습' },
  { id: '3', name: '코니_동물.json', title: '코니 - 동물 연습' },
  { id: '4', name: '희니_겨울.json', title: '희니 - 겨울 연습' },
];

const PracticeMenuScreen = () => {
  const navigation = useNavigation<PracticeMenuScreenNavigationProp>();
  const { theme } = useTheme();
  const Colors = getColors(theme);

  const handleSelectPractice = (fileName: string) => {
    navigation.navigate('TypingPractice', { practiceFileName: fileName });
  };

  const renderItem = ({ item }: { item: typeof practiceFiles[0] }) => (
    <TouchableOpacity style={themedStyles.item} onPress={() => handleSelectPractice(item.name)}>
      <Text style={themedStyles.itemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: Colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: 'NanumBarunGothic',
      color: Colors.textPrimary,
    },
    listContainer: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    item: {
      backgroundColor: Colors.surface,
      padding: 15,
      marginVertical: 8,
      borderRadius: 10,
      shadowColor: Colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    itemText: {
      fontSize: 18,
      color: Colors.textPrimary,
      fontFamily: 'NanumBarunGothic',
    },
  });

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>연습 메뉴</Text>
      <FlatList
        data={practiceFiles}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={themedStyles.listContainer}
      />
    </View>
  );
};

export default PracticeMenuScreen;
