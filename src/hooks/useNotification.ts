import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export const useNotificationHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("User tapped notification:", response);
        const meetingId =
          response.notification.request.content.data?.meeting_id;
        if (meetingId) {
          router.push(`/(meeting)/${meetingId}`);
        }
      },
    );
    (async () => {
      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        console.log(
          "App opened from killed state via notification:",
          lastResponse,
        );
        const meetingId =
          lastResponse.notification.request.content.data?.meeting_id;
        if (meetingId) {
          router.push(`/(meeting)/${meetingId}`);
        }
      }
    })();

    return () => subscription.remove();
  }, []);
};
