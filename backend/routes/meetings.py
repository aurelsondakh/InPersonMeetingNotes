from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from utils import supabase

router = APIRouter()

@router.get("/meetings")
async def get_meetings(push_token: str = Query(...)):
    """
    Get meetings filtered by push_token, ordered by created_at descending.
    """
    try:
        supabase.postgrest.headers.update({"request.push_token": push_token})
        data = (
            supabase.table("meetings")
            .select("*")
            .eq("push_token", push_token)
            .order("created_at", desc=True)
            .execute()
        )

        return JSONResponse({"meetings": data.data})

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
