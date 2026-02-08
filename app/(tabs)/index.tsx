import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { File } from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//Constants
import { Colors } from "@/src/constant/colors";
import { FontSize } from "@/src/constant/fontSize";

//Lib
import {
  startForegroundService,
  stopForegroundService,
} from "@/src/lib/helper/foregroundService";
import { registerForPushNotificationsAsync } from "@/src/lib/helper/pushNotificationService";
import { uploadMeetingAudio } from "@/src/services/meetingService";

//Service

const HomePage = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [expoPushToken, setExpoPushToken] = useState<string>("");

  const recordingOptions = {
    android: {
      extension: ".m4a",
      outputFormat: 2,
      audioEncoder: 3,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      audioQuality: 2,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 128000,
    },
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      console.log("token");
      if (token) setExpoPushToken(token);
    });
  }, []);

  const checkPermission = async (): Promise<boolean> => {
    const { status } = await Audio.getPermissionsAsync();
    if (status === "granted") return true;

    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Permission required",
        "Microphone permission is required to record audio.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  // START RECORDING
  const startRecording = async () => {
    const hasPermission = await checkPermission();
    if (!hasPermission) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();

      if (Platform.OS === "android") {
        await startForegroundService();
      }

      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);

      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording)
          setRecordDuration(Math.floor(status.durationMillis / 1000));
      });
    } catch (err) {
      console.error(err);
    }
  };

  const pauseOrResumeRecording = async () => {
    if (!recording) return;

    try {
      if (!isPaused) {
        await recording.pauseAsync();
        setIsPaused(true);
        setIsRecording(false);
      } else {
        await recording.startAsync();
        setIsPaused(false);
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Pause/Resume error:", err);
    }
  };

  // STOP RECORDING
  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const meetingId = `meeting-${Date.now()}`;
      let uri = recording.getURI() || "";

      if (Platform.OS === "ios" && !uri.startsWith("file://")) {
        uri = "file://" + uri;
      }

      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      setRecordDuration(0);

      if (Platform.OS === "android") {
        await stopForegroundService();
      }

      if (uri) {
        try {
          console.log("TRY UPLOAD");
          const response = await uploadMeetingAudio(
            uri,
            meetingId,
            expoPushToken,
          );
          console.log("Backend response:", response);
        } catch (err) {
          console.error("Error uploading audio:", err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE RECORDING
  const deleteRecording = async () => {
    try {
      let uri: string | null = null;

      if (recording) {
        uri = recording.getURI();
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (uri) {
        const file = new File(uri);
        await file.delete();
        console.log("File deleted:", uri);
      }

      setIsRecording(false);
      setIsPaused(false);
      setRecordDuration(0);
    } catch (err) {
      console.error("Delete recording error:", err);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleTextContainer}>
        <Text style={styles.titleText}>Meeting Recorder</Text>
      </View>

      <View style={styles.recordContainer}>
        <Text style={styles.durationText}>
          {formatDuration(recordDuration)}
        </Text>

        <View style={styles.buttonContainer}>
          {!isRecording && !isPaused ? (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
            >
              <View style={styles.recordDot} />
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={deleteRecording}
              >
                <Ionicons name="trash" size={24} color={Colors.lightRed} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={pauseOrResumeRecording}
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={42}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={stopRecording}
              >
                <Ionicons name="stop" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  titleTextContainer: { padding: 24 },
  titleText: {
    fontSize: FontSize.large,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  recordContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  recordButton: {
    borderRadius: 35,
    padding: 5,
    borderWidth: 2,
  },
  recordDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.red,
  },
  durationText: {
    fontSize: FontSize.medium,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  controlButton: {
    backgroundColor: Colors.lightWhite,
    padding: 12,
    borderRadius: 35,
  },
  playbackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  playbackText: {
    fontSize: FontSize.medium,
    color: Colors.textPrimary,
  },
});
