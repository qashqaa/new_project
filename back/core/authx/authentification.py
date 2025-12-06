from authx import AuthX, AuthXConfig
from dotenv import load_dotenv
import os

load_dotenv()

config = AuthXConfig()

config.JWT_SECRET_KEY = os.getenv("jwt_secret_key")
config.JWT_ACCESS_COOKIE_NAME = "access_token"
config.JWT_TOKEN_LOCATION = ["cookies"]
config.JWT_COOKIE_CSRF_PROTECT = False

security = AuthX(config=config)
