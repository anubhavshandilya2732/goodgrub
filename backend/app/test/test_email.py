import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

# print(os.getenv("EMAIL_HOST_USER"))
# print(os.getenv("EMAIL_HOST_PASSWORD"))

def send_otp_email(email, otp):
    sender = os.getenv("EMAIL_HOST_USER")
    password = os.getenv("EMAIL_HOST_PASSWORD")
    message = f"Subject: OTP Verification\n\nYour OTP is: {otp}"
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, email, message)
send_otp_email("kingkunalanand@gmail.com", "123456")