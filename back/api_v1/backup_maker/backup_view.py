from fastapi import APIRouter
from core.postgres_db import SessionDepPG
from api_v1.backup_maker.backup_services import make_backup

router = APIRouter(tags=["backup"], prefix="/backup")


@router.get("/")
async def send_msg():
    result:str = await make_backup()
    return {"MESSAGE": result}