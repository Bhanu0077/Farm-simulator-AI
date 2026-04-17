import smtplib
from email.message import EmailMessage

import requests


class EmailDeliveryError(Exception):
    pass


def send_email(config, to_email, subject, html, text):
    provider = config.get("EMAIL_PROVIDER", "console").lower()

    if provider == "resend":
        return _send_with_resend(config, to_email, subject, html, text)
    if provider == "smtp":
        return _send_with_smtp(config, to_email, subject, html, text)

    print(f"EMAIL TO: {to_email}")
    print(f"EMAIL SUBJECT: {subject}")
    print(text)
    return {"provider": "console", "message": "Email printed to console"}


def _send_with_resend(config, to_email, subject, html, text):
    api_key = config.get("RESEND_API_KEY")
    from_email = config.get("EMAIL_FROM")
    api_url = config.get("RESEND_API_URL")

    if not api_key:
        raise EmailDeliveryError("RESEND_API_KEY is not configured")

    if not from_email:
        raise EmailDeliveryError("EMAIL_FROM is not configured")

    response = requests.post(
        api_url,
        headers={
          "Authorization": f"Bearer {api_key}",
          "Content-Type": "application/json",
        },
        json={
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html,
            "text": text,
        },
        timeout=15,
    )

    if not response.ok:
        raise EmailDeliveryError(f"Email provider error: {response.text}")

    return response.json()


def _send_with_smtp(config, to_email, subject, html, text):
    host = config.get("SMTP_HOST")
    port = config.get("SMTP_PORT")
    username = config.get("SMTP_USERNAME")
    password = config.get("SMTP_PASSWORD")
    from_email = config.get("EMAIL_FROM") or username
    use_tls = config.get("SMTP_USE_TLS", True)

    if not host:
        raise EmailDeliveryError("SMTP_HOST is not configured")
    if not port:
        raise EmailDeliveryError("SMTP_PORT is not configured")
    if not username:
        raise EmailDeliveryError("SMTP_USERNAME is not configured")
    if not password:
        raise EmailDeliveryError("SMTP_PASSWORD is not configured")
    if not from_email:
        raise EmailDeliveryError("EMAIL_FROM is not configured")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(text)
    message.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(host, port, timeout=20) as server:
            if use_tls:
                server.starttls()
            server.login(username, password)
            server.send_message(message)
    except Exception as error:
        raise EmailDeliveryError(f"SMTP email sending failed: {error}") from error

    return {"provider": "smtp", "message": "Email sent successfully"}
