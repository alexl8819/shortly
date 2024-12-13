interface CaptchaResult {
    success: boolean,
    'error-codes': Array<string>
}

export async function validateCaptcha (token: string, secret: string): Promise<boolean> {
    let verifyResponse;

    const serialized = new URLSearchParams();
    serialized.append('response', token);
    serialized.append('secret', secret);

    try {
        verifyResponse = await fetch('https://api.hcaptcha.com/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: serialized
        });
    } catch (err) {
        console.error(err);
        return false;
    }

    if (verifyResponse && !verifyResponse.ok) {
        console.log(verifyResponse.status);
        return false;
    }

    const result: CaptchaResult = await verifyResponse.json();
    
    if (!result.success && result['error-codes']) {
        console.log(result['error-codes']);
        return false;
    }

    return result['success'];
}