import dayjs from 'dayjs';
import xss from 'xss';

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
    let r = res;

    if (req.method === 'OPTIONS') {
        r = new Response(null, { status: 200 });
        r.headers.set('Access-Control-Max-Age', '86400');
    }

    r.headers.set('Access-Control-Allow-Origin', options && options.preferredOrigin ? options.preferredOrigin : '*');

    if (options && options.supportedMethods.length) {
        r.headers.set('Access-Control-Allow-Methods', options.supportedMethods.map((method) => method.toUpperCase()).join(', '));
    }
    
    if (options && options.headers && options.headers.length) {
        r.headers.set('Access-Control-Allow-Headers', options.headers.map(
            (header) => header[0].toUpperCase() + header.slice(1)
        ).join(', ') || 'Content-Type');
    }

    return r;
}

export function hasExpired (futureDate: string | Date) {
    const now = dayjs().utc();
    const future = dayjs(futureDate).utc();
    return future.isBefore(now, 'minute') || future.isSame(now, 'minute');
}

export function sanitize (str: string) {
    return xss(str);
}

export async function isURLActive (url: string, retries: number = 1) {
    let urlCheckResponse;

    try {
        urlCheckResponse = await fetch(url, {
            signal: AbortSignal.timeout(3000)
        });
    } catch (err) {
        console.error(err);

        if (retries === 0) {
            return false;
        }

        return isURLActive(url, retries - 1);
    }

    return urlCheckResponse.ok || urlCheckResponse.redirected;
}

export function getClientIP (headers: Headers) {
    return import.meta.env.DEV ? '127.0.0.1' : headers.get('x-client-ip') || headers.get('x-forwarded-for')?.split(',')[0] || headers.get('cf-connecting-ip') 
    || headers.get('fastly-client-ip') || headers.get('true-client-ip') || headers.get('x-real-ip') || headers.get('x-cluster-client-ip') || headers.get('appengine-user-ip')
    || headers.get('x-forwarded') || headers.get('forwarded-for') || headers.get('cf-pseudo-ipv4');
}