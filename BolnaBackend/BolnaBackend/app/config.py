import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DB_HOST = os.getenv("DB_HOST")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")

    # Bolna API Configuration
    BOLNA_BASE_URL = os.getenv("BOLNA_BASE_URL", "https://api.bolna.ai")
    BOLNA_API_KEY = os.getenv("BOLNA_API_KEY")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

settings = Settings()