import os
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from api_v1.CRM.crm_main import router as crm_router

app = FastAPI()
app.include_router(crm_router)

# CORS настройки
origins = [
    "http://frontend:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}
