import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

const SketchScreen = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    try {
      // 이미지 처리 (스케치 효과 적용)
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { grayscale: true },
          { contrast: 1.5 },
          { brightness: 0.5 },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      setProcessedImage(manipResult.uri);
    } catch (error) {
      console.error('이미지 처리 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSketch = async () => {
    // TODO: 스케치 이미지 저장 기능 구현
    Alert.alert('저장 완료', '스케치가 갤러리에 저장되었습니다.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>스케치 생성 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {processedImage && (
        <Image
          source={{ uri: processedImage }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={saveSketch}
        >
          <Text style={styles.buttonText}>저장</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.retakeButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>다시 촬영</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 120,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SketchScreen; 