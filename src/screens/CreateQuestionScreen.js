import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';

const CreateQuestionScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState('보통');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    // TODO: API를 통해 문제 생성 요청 보내기
    Alert.alert(
      '성공',
      '문제가 생성되었습니다.',
      [
        {
          text: '확인',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>새 문제 만들기</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="문제 제목을 입력하세요"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>내용</Text>
        <TextInput
          style={[styles.input, styles.contentInput]}
          value={content}
          onChangeText={setContent}
          placeholder="문제 내용을 입력하세요"
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>난이도</Text>
        <View style={styles.difficultyContainer}>
          {['쉬움', '보통', '어려움'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                difficulty === level && styles.difficultyButtonSelected
              ]}
              onPress={() => setDifficulty(level)}
            >
              <Text style={[
                styles.difficultyButtonText,
                difficulty === level && styles.difficultyButtonTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>문제 생성</Text>
      </TouchableOpacity>
    </ScrollView>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  difficultyButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  difficultyButtonText: {
    fontSize: 16,
    color: '#333',
  },
  difficultyButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateQuestionScreen; 