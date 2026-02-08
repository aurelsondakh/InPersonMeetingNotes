import { BASE_URL } from "../constant/globalUrl";
import { Meeting } from "../types";

export const fetchMeetings = async (pushToken: string): Promise<Meeting[]> => {
  const res = await fetch(`${BASE_URL}/meetings?push_token=${pushToken}`);
  if (!res.ok) throw new Error("Failed to fetch meetings");

  const data = await res.json();
  return data.meetings || [];
};

export const fetchMeetingDetail = async (
  meetingId: string,
  pushToken: string,
): Promise<Meeting> => {
  const res = await fetch(
    `${BASE_URL}/meeting/${meetingId}?push_token=${pushToken}`,
  );
  if (!res.ok) throw new Error("Failed to fetch meeting detail");

  const data = await res.json();
  return data.meeting;
};

export const uploadMeetingAudio = async (
  fileUri: string,
  meetingId: string,
  pushToken: string,
) => {
  const formData = new FormData();
  formData.append("audio_file", {
    uri: fileUri,
    name: `${meetingId}.m4a`,
    type: "audio/m4a",
  } as any);
  formData.append("push_token", pushToken);

  const res = await fetch(`${BASE_URL}/process-meeting`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload audio");
  }

  const data = await res.json();
  return data;
};
