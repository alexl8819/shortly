import type { APIRoute } from "astro";

import { supabaseClient } from "../../../lib/client";

export const POST: APIRoute = async ({ request, redirect }) => {
    const form = await request.formData();

    const email = form.get('email')?.toString();
    const password = form.get('password')?.toString();
    const captchaToken = form.get('captchaToken')?.toString();

    if (!email || !password || !captchaToken) {
        return new Response(JSON.stringify({
            error: 'Missing email, password or token'
        }), {status: 400});
    }

    const successCaptcha = await validateCaptcha(captchaToken, import.meta.env.HCAPTCHA_SECRET_KEY);

    if (!successCaptcha) {
        return new Response(JSON.stringify({
            error: 'Failed to validate captcha'
        }), { status: 500 });
    }
    
    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
    });

    if (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), { status: 500 });
    }
    
    return redirect('/login?checkEmail=true');
}

// Custom HCaptcha Validatation
// Used for account registration only
async function validateCaptcha (token: string, secret: string): Promise<boolean> {
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