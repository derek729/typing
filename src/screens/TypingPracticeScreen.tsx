import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { decomposeKorean, compareKoreanJamo } from '../utils/koreanTypingUtils';
import { getColors } from '../utils/colors';
import { useTheme } from '../context/ThemeContext';

type TypingPracticeScreenRouteProp = RouteProp<RootStackParamList, 'TypingPractice'>;

interface PracticeDataItem {
  text: string;
  length: number;
}

interface PracticeData {
  name: string;
  description: string;
  data: PracticeDataItem[];
}

// Helper to get the last character of a string, handling empty string
const getLastChar = (str: string) => (str.length > 0 ? str[str.length - 1] : '');

const TypingPracticeScreen = () => {
  const route = useRoute<TypingPracticeScreenRouteProp>();
  const { practiceFileName } = route.params;
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [targetText, setTargetText] = useState<string>('');
  const [typedText, setTypedText] = useState<string>(''); // Raw input from TextInput
  const [composedTypedText, setComposedTypedText] = useState<string>(''); // Text after Korean composition
  const [currentIndex, setCurrentIndex] = useState<number>(0); // Index in targetText
  const [errors, setErrors] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const textInputRef = useRef<TextInput>(null);

  const { theme } = useTheme();
  const Colors = getColors(theme);

  const loadAndSetPracticeData = useCallback(async () => {
    try {
      setLoading(true);
      let dataModule;
      switch (practiceFileName) {
        case '기니_과일.json':
          dataModule = require('../../assets/PracticeData/기니_과일.json');
          break;
        case '라니_숫자.json':
          dataModule = require('../../assets/PracticeData/라니_숫자.json');
          break;
        case '코니_동물.json':
          dataModule = require('../../assets/PracticeData/코니_동물.json');
          break;
        case '희니_겨울.json':
          dataModule = require('../../assets/PracticeData/희니_겨울.json');
          break;
        default:
          throw new Error('Unknown practice file: ' + practiceFileName);
      }
      setPracticeData(dataModule);
      const fullText = dataModule.data.map((item: PracticeDataItem) => item.text).join(' ');
      setTargetText(fullText);
      setLoading(false);
      setTimeout(() => textInputRef.current?.focus(), 100);
    } catch (e: any) {
      console.error('Failed to load practice data:', e);
      setError(e.message || '데이터 로드 실패');
      setLoading(false);
    }
  }, [practiceFileName]);

  useEffect(() => {
    loadAndSetPracticeData();
  }, [loadAndSetPracticeData]);

  const resetPractice = () => {
    setTypedText('');
    setComposedTypedText('');
    setCurrentIndex(0);
    setErrors(0);
    setStartTime(null);
    setEndTime(null);
    setError(null);
    textInputRef.current?.clear();
    textInputRef.current?.focus();
  };

  const handleTextInputChange = (newInput: string) => {
    if (!startTime && newInput.length > 0) {
      setStartTime(Date.now());
    }

    // Prevent typing beyond the target text length
    if (newInput.length > targetText.length) {
      return;
    }

    setTypedText(newInput);

    // --- Korean Composition Logic --- //
    let currentComposed = '';
    let tempErrors = 0;
    let tempCurrentIndex = 0;

    for (let i = 0; i < newInput.length; i++) {
      const targetChar = targetText[i];
      const typedChar = newInput[i];

      if (!targetChar) break; // Reached end of target text

      if (compareKoreanJamo(targetChar, typedChar)) {
        currentComposed += typedChar;
      } else {
        currentComposed += typedChar; // Still add for display
        tempErrors++;
      }
      tempCurrentIndex++;
    }

    setComposedTypedText(currentComposed);
    setErrors(tempErrors);
    setCurrentIndex(tempCurrentIndex);
    // --- End Korean Composition Logic --- //

    if (newInput.length === targetText.length && targetText.length > 0) {
      setEndTime(Date.now());
      Keyboard.dismiss();
    }
  };

  const getCharStyle = (char: string, index: number) => {
    if (index < composedTypedText.length) {
      // Compare using Jamo for accuracy
      return compareKoreanJamo(targetText[index], composedTypedText[index]) ? themedStyles.correctChar : themedStyles.incorrectChar;
    } else if (index === currentIndex) {
      return themedStyles.currentChar;
    }
    return themedStyles.defaultChar;
  };

  const calculateWPM = () => {
    if (!startTime || !endTime) return 0;
    const durationInMinutes = (endTime - startTime) / 60000;
    if (durationInMinutes <= 0) return 0;
    return Math.round((composedTypedText.length / 5) / durationInMinutes);
  };

  const calculateAccuracy = () => {
    if (composedTypedText.length === 0) return 0;
    return Math.round(((composedTypedText.length - errors) / composedTypedText.length) * 100);
  };

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: Colors.background,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      fontFamily: 'NanumBarunGothic',
      color: Colors.textPrimary,
    },
    description: {
      fontSize: 16,
      color: Colors.textSecondary,
      marginBottom: 20,
      fontFamily: 'NanumBarunGothic',
    },
    practiceTextContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 20,
      borderWidth: 1,
      borderColor: Colors.mediumGray,
      padding: 10,
      borderRadius: 5,
      minHeight: 100,
    },
    practiceChar: {
      fontSize: 20,
      marginHorizontal: 1,
      marginVertical: 2,
      fontFamily: 'NanumBarunGothic',
    },
    defaultChar: {
      color: Colors.textPrimary,
    },
    currentChar: {
      backgroundColor: Colors.accent,
      color: Colors.textPrimary,
      borderRadius: 3,
      fontFamily: 'NanumBarunGothic',
    },
    correctChar: {
      color: Colors.success,
      fontFamily: 'NanumBarunGothic',
    },
    incorrectChar: {
      color: Colors.error,
      textDecorationLine: 'underline',
      fontFamily: 'NanumBarunGothic',
    },
    textInput: {
      borderWidth: 1,
      borderColor: Colors.mediumGray,
      borderRadius: 5,
      width: '90%',
      height: 100,
      marginTop: 20,
      padding: 10,
      fontSize: 18,
      textAlignVertical: 'top',
      fontFamily: 'NanumBarunGothic',
      color: Colors.textPrimary,
      backgroundColor: Colors.surface,
    },
    resultsContainer: {
      marginTop: 20,
      alignItems: 'center',
    },
    resultText: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 5,
      fontFamily: 'NanumBarunGothic',
      color: Colors.textPrimary,
    },
    errorText: {
      color: Colors.error,
      fontSize: 18,
      fontFamily: 'NanumBarunGothic',
    },
    restartButton: {
      marginTop: 20,
      backgroundColor: Colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    restartButtonText: {
      color: Colors.surface,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'NanumBarunGothic',
    },
    retryButton: {
      marginTop: 10,
      backgroundColor: Colors.success,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    retryButtonText: {
      color: Colors.surface,
      fontSize: 16,
      fontFamily: 'NanumBarunGothic',
    },
  });

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>{practiceData?.name || '타자 연습'}</Text>
      <Text style={themedStyles.description}>{practiceData?.description}</Text>

      <View style={themedStyles.practiceTextContainer}>
        {targetText.split('').map((char, index) => (
          <Text key={index} style={[themedStyles.practiceChar, getCharStyle(char, index)]}>
            {char === ' ' ? '_' : char}
          </Text>
        ))}
      </View>

      <TextInput
        ref={textInputRef}
        style={themedStyles.textInput}
        value={typedText}
        onChangeText={handleTextInputChange}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={true}
        editable={endTime === null} // Disable input after practice ends
      />

      {endTime !== null && (
        <View style={themedStyles.resultsContainer}>
          <Text style={themedStyles.resultText}>WPM: {calculateWPM()}</Text>
          <Text style={themedStyles.resultText}>정확도: {calculateAccuracy()}%</Text>
          <Text style={themedStyles.resultText}>오류: {errors}</Text>
          <TouchableOpacity onPress={resetPractice} style={themedStyles.restartButton}>
            <Text style={themedStyles.restartButtonText}>다시 시작</Text>
          </TouchableOpacity>
        </View>
      )}

      {endTime === null && ( // Show restart button only during practice or before it starts
        <TouchableOpacity onPress={resetPractice} style={themedStyles.restartButton}>
          <Text style={themedStyles.restartButtonText}>초기화</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TypingPracticeScreen;
