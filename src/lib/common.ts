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

    return result.success;
}

export interface CorsOptions {
    supportedMethods: Array<string>,
    headers?: Array<string>,
    preferredOrigin?: string
}

export function withCors (req: Request, res: Response, options: CorsOptions) {
    res.headers.set('Access-Control-Allow-Origin', options && options.preferredOrigin ? options.preferredOrigin : '*');

    if (options && options.supportedMethods.length) {
        res.headers.set('Access-Control-Allow-Methods', options.supportedMethods.map((method) => method.toUpperCase()).join(', '));
    }
    
    if (options && options.headers && options.headers.length) {
        res.headers.set('Access-Control-Allow-Headers', options.headers.map(
            (header) => header[0].toUpperCase() + header.slice(1)
        ).join(', ') || 'Content-Type');
    }
    
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200 });
    }

    return res;
}