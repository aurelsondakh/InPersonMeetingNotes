from fastapi import (
    APIRouter,
    File,
    UploadFile,
    Form,
    BackgroundTasks,
)
from fastapi.responses import JSONResponse
import tempfile, os

from utils import (
    supabase,
    upload_to_supabase,
)
from worker.meeting_worker import process_meeting_background

router = APIRouter()

@router.post("/process-meeting")
async def process_meeting(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    push_token: str = Form(...),
):
    try:
        filename = audio_file.filename or "recording.m4a"
        ext = os.path.splitext(filename)[1] or ".m4a"

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await audio_file.read())
            tmp_path = tmp.name

        audio_url = upload_to_supabase(tmp_path, filename)

        result = supabase.table("meetings").insert({
            "audio_url": audio_url,
            "push_token": push_token,
            "status": "processing",
        }).execute()

        meeting_id = result.data[0]["id"]
        
        print('GO INTO BACKGROUND TASK')

        background_tasks.add_task(
            process_meeting_background,
            meeting_id,
            tmp_path,
            push_token,
        )
        
        print('SUCCESS GO INTO BACKGROUND TASK')

        return JSONResponse({
            "meeting_id": meeting_id,
            "status": "processing",
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(
            {"error": str(e)},
            status_code=500,
        )
