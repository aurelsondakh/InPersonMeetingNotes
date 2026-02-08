from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from utils import supabase

router = APIRouter()

@router.get("/meeting/{id}")
async def get_meeting_detail(id: str, push_token: str = Query(...)):
    """
    Get a meeting detail by ID, only if it belongs to the device's push_token.
    Returns a signed URL for the audio file.
    """
    try:
        data = (
            supabase.table("meetings")
            .select("*")
            .eq("id", id)
            .eq("push_token", push_token)
            .single()
            .execute()
        )
        meeting = data.data

        if not meeting:
            return JSONResponse({"error": "Meeting not found or access denied"}, status_code=404)
        
        if meeting.get("audio_url"):
            filename = meeting["audio_url"].split("/")[-1]
            signed_url_data = supabase.storage.from_("recordings").create_signed_url(filename, 3600)
            meeting["audio_url"] = signed_url_data.get("signedUrl")

        return JSONResponse({"meeting": meeting})

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
