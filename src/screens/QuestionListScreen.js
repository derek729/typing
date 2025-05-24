import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const QuestionListScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // TODO: API에서 문제 목록을 가져오는 로직 구현
    // 임시 데이터
    setQuestions([
      { id: 1, title: '첫 번째 문제', difficulty: '쉬움' },
      { id: 2, title: '두 번째 문제', difficulty: '보통' },
      { id: 3, title: '세 번째 문제', difficulty: '어려움' },
    ]);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.questionItem}
      onPress={() => navigation.navigate('SolveQuestion', { questionId: item.id })}
    >
      <Text style={styles.questionTitle}>{item.title}</Text>
      <Text style={styles.questionDifficulty}>난이도: {item.difficulty}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>문제 목록</Text>
      <FlatList
        data={questions}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  questionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  questionDifficulty: {
    fontSize: 14,
    color: '#666',
  },
});

export default QuestionListScreen; 