from typing import List

from authx.exceptions import JWTDecodeError, MissingTokenError
from fastapi import Request, HTTPException, status
from fastapi.params import Depends

from core.authx.authentification import security


def verify(required_roles: List[str] = None):
    if required_roles is None:
        required_roles = []

    async def dependency(request: Request):
        try:
            user_data = await security.access_token_required(request)
            print(user_data.role)
            if required_roles and user_data.role not in required_roles:
                raise HTTPException(status_code=403, detail="Access denied")
            return user_data
        except JWTDecodeError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT token error"
            )
        except MissingTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="missing verify token"
            )

    return dependency


crm_verify_dep_CRUD = Depends(lambda: verify(["owner", "developer"]))

crm_verify_dep_R = Depends(lambda: verify(["moderator", "owner", "developer", "user"]))

crm_verify_dep_CR = Depends(lambda: verify(["moderator", "owner", "developer"]))

crm_verify_dep_CRU = Depends(lambda: verify(["moderator", "owner", "developer"]))
