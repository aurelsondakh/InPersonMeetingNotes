# app/workers/meeting_worker.py
import os
from utils import (
    supabase,
    transcribe_audio,
    summarize_text,
    send_push_notification,
)

async def process_meeting_background(
    meeting_id: int,
    tmp_path: str,
    push_token: str,
):
    try:
        transcript = await transcribe_audio(tmp_path)
        summary = await summarize_text(transcript)

        supabase.table("meetings").update({
            "transcript": transcript,
            "summary": summary,
            "status": "ready",
        }).eq("id", meeting_id).execute()

        await send_push_notification(push_token, meeting_id)

    except Exception as e:
        supabase.table("meetings").update({
            "status": "failed",
        }).eq("id", meeting_id).execute()
        raise e

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
