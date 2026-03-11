import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(ACCOUNT_SID, AUTH_TOKEN)



def make_resolution_call(phone_number: str):
    """
    Make an outbound call to the given phone number.
    
    Args:
        phone_number: The phone number to call (e.g., "+919876543210")
    """
    message = f"""
    <Response>
    <Say voice="alice">
        Your complaint has been resolved. Thank you for your patience.
    </Say>
    </Response>
    """

    call = client.calls.create(
        to=phone_number,
        from_=TWILIO_NUMBER,
        twiml=message
    )

    return call.sid


# </Response>
#     <Response>
#         <Say voice="alice" language="gu-IN">
#             તમારો એજન્ટ આઈડી {agent_id} માટે નોંધાયેલી ફરિયાદ હવે રિસોલ્વ થઈ ગઈ છે.
#         </Say>
#     </Response>