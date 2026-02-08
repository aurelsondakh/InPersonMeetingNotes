export interface Meeting {
  id: string;
  audio_url: string;
  transcript?: string;
  summary?: string;
  status: "processing" | "ready";
  push_token?: string;
  created_at: string;
}
