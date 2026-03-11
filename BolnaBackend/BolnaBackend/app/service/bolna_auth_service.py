import requests
from datetime import datetime, timedelta
from app.config import settings
from app.database import get_connection


AUTH_URL = "https://auth.bolna.ai/auth/v1/token?grant_type=password"
REFRESH_URL = "https://auth.bolna.ai/auth/v1/token?grant_type=refresh_token"


def bolna_login():
    headers = {
        "apikey": settings.BOLNA_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "email": settings.BOLNA_EMAIL,
        "password": settings.BOLNA_PASSWORD
    }

    response = requests.post(AUTH_URL, headers=headers, json=payload)
    response.raise_for_status()

    data = response.json()
    expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT id FROM bolna_auth_tokens LIMIT 1")
        row = cursor.fetchone()

        if row:
            cursor.execute("""
                UPDATE bolna_auth_tokens
                SET access_token=%s, refresh_token=%s, expires_at=%s
                WHERE id=%s
            """, (data["access_token"], data["refresh_token"], expires_at, row[0]))
        else:
            cursor.execute("""
                INSERT INTO bolna_auth_tokens (access_token, refresh_token, expires_at)
                VALUES (%s,%s,%s)
            """, (data["access_token"], data["refresh_token"], expires_at))

        connection.commit()

    finally:
        cursor.close()
        connection.close()

    return data["access_token"]


def refresh_bolna_token(refresh_token):
    headers = {
        "apikey": settings.BOLNA_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {"refresh_token": refresh_token}

    response = requests.post(REFRESH_URL, headers=headers, json=payload)
    response.raise_for_status()

    data = response.json()
    expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            UPDATE bolna_auth_tokens
            SET access_token=%s, refresh_token=%s, expires_at=%s
            WHERE id=1
        """, (data["access_token"], data["refresh_token"], expires_at))

        connection.commit()

    finally:
        cursor.close()
        connection.close()

    return data["access_token"]


def get_valid_token():
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT access_token, refresh_token, expires_at FROM bolna_auth_tokens LIMIT 1")
        row = cursor.fetchone()

        if not row:
            return bolna_login()

        access_token, refresh_token, expires_at = row

        if datetime.utcnow() >= expires_at:
            return refresh_bolna_token(refresh_token)

        return access_token

    finally:
        cursor.close()
        connection.close()