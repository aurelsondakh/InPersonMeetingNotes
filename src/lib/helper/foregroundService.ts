import notifee, { AndroidColor } from "@notifee/react-native";

export const startForegroundService = async () => {
  const channelId = await notifee.createChannel({
    id: "recording",
    name: "Recording",
  });
  notifee.displayNotification({
    title: "Android audio background recording",
    body: "recording...",
    android: {
      channelId,
      asForegroundService: true,
      color: AndroidColor.RED,
      colorized: true,
    },
  });
};

export const stopForegroundService = async () => {
  await notifee.stopForegroundService();
};
