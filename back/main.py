from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from api_v1.CRM.crm_main import router as crm_router

app = FastAPI()

app.include_router(crm_router)
# app.include_router(crm_onboarding_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],  # URL вашего Vite фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["dev"])
def start():
    print("hello bro")


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
