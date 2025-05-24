import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../api/config';

const PhotoScreen = () => {
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    });

    if (result.assets && result.assets[0]) {
      setCapturedImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!capturedImage) {
      Alert.alert('알림', '사진을 촬영해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', {
      uri: capturedImage.uri,
      type: capturedImage.type,
      name: capturedImage.fileName,
    });

    try {
      const response = await axios.post(
        `${API_URL}${API_ENDPOINTS.PHOTOS.UPLOAD}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert('성공', '사진이 업로드되었습니다.');
      setCapturedImage(null);
    } catch (error) {
      Alert.alert('오류', '업로드 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleCapture}>
        <Text style={styles.buttonText}>사진 촬영</Text>
      </TouchableOpacity>

      {capturedImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: capturedImage.uri }}
            style={styles.image}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.buttonText}>업로드</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
});

export default PhotoScreen; 