from fastapi import FastAPI
from routes import process_meeting, meetings, meeting_detail

app = FastAPI()

app.include_router(process_meeting.router)
app.include_router(meetings.router)
app.include_router(meeting_detail.router)
