<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Timer Stopped</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
        <div style="background:#ffffff;border-radius:20px;padding:32px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 16px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#0284c7;">
                CareVance Tracker
            </p>
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#020617;">
                Your timer was stopped automatically
            </h1>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
                Hi {{ $userName ?: 'there' }},
            </p>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
                Your CareVance desktop timer stopped after {{ $idleSeconds }} seconds of idle time.
            </p>
            <div style="margin:0 0 24px;border-radius:18px;background:#f8fafc;border:1px solid #dbeafe;padding:20px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0369a1;">
                    Idle Stop Details
                </p>
                <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
                    Idle threshold: <strong style="color:#020617;">{{ $idleSeconds }} seconds</strong>
                </p>
                <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
                    Stopped at: <strong style="color:#020617;">{{ $stoppedAt->copy()->timezone($timezone)->format('F j, Y g:i:s A T') }}</strong>
                </p>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">
                    Timezone: <strong style="color:#020617;">{{ $timezone }}</strong>
                </p>
            </div>
            <div style="border-radius:16px;background:#e0f2fe;padding:18px 20px;color:#0c4a6e;font-size:15px;line-height:1.7;">
                Open the desktop app and start the timer again when you are ready to continue tracking. The stop time above reflects your real desktop timezone.
            </div>
        </div>
    </div>
</body>
</html>
