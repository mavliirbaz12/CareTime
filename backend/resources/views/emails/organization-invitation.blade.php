<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Invitation</title>
</head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbeafe;border-radius:20px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#0369a1;font-weight:700;">CareVance Invitation</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">You have been invited to join {{ $invitation->organization->name }}</h1>
        <p style="margin:0 0 12px;font-size:16px;line-height:1.7;">
            {{ $invitation->invitedBy?->name ?: 'An administrator' }} invited you to join as
            <strong style="text-transform:capitalize;">{{ $invitation->role }}</strong>.
        </p>
        <p style="margin:0 0 12px;font-size:16px;line-height:1.7;">
            Click the button below to review the invitation. You can accept or decline it from that page.
        </p>
        <p style="margin:24px 0;">
            <a href="{{ $invitationUrl }}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;">Review Invitation</a>
        </p>
        <p style="margin:0 0 8px;font-size:14px;color:#475569;">This invitation was sent to {{ $invitation->email }}.</p>
        <p style="margin:0;font-size:14px;color:#475569;">
            It expires on {{ optional($invitation->expires_at)->toDayDateTimeString() ?: 'a future date' }}.
        </p>
    </div>
</body>
</html>
