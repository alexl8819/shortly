// Custom HCaptcha Validatation
// Used for account registration only
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

    if (verifyResponse && verifyResponse.status !== 200) {
        console.log(verifyResponse.status);
        return false;
    }

    const statusState = await verifyResponse?.json();
    
    if (!statusState['success'] && statusState['error-codes']) {
        console.log(statusState['error-codes']);
        return false;
    }

    return statusState['success'];
}