from openai import OpenAI
from supabase import create_client
import httpx
import os
import asyncio

from config import OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Setup OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)

# Setup Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# --- Upload audio file to Supabase ---
def upload_to_supabase(file_path: str, dest_filename: str) -> str:
    """Upload audio ke Supabase Storage dan return public URL"""
    with open(file_path, "rb") as f:
        supabase.storage.from_("recordings").upload(dest_filename, f, {"cacheControl": "3600"})
    
    public_url = supabase.storage.from_("recordings").get_public_url(dest_filename)
    return public_url


# --- Transcribe with Whisper ---
async def transcribe_audio(file_path: str) -> str:
    with open(file_path, "rb") as f:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=f
        )
    return transcription.text

# --- Summarize with GPT ---
async def summarize_text(text: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You summarize meeting transcripts concisely."},
            {"role": "user", "content": text}
        ]
    )
    # Ambil hasil summary
    return response.choices[0].message.content

# --- Send push notification to Expo ---
async def send_push_notification(push_token: str, meeting_id: str):
    url = "https://exp.host/--/api/v2/push/send"
    print(push_token, 'PUSHTOKEN')
    payload = {
        "to": push_token,
        "title": "Meeting Transcript Ready",
        "body": "Tap to view the transcript",
        "data": {"meeting_id": meeting_id},
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)

    print("📬 PUSH STATUS CODE:", response.status_code)
    print("📬 PUSH RESPONSE:", response.text)

    response.raise_for_status()