import type { APIRoute } from "astro";

import { supabaseClient } from "../../../lib/client";
import { type CorsOptions, withCors, validateCaptcha } from "../../../lib/common";

const IS_PROD = import.meta.env.prod;
const CORS_DOMAIN = import.meta.env.PUBLIC_CORS_DOMAIN;

const CORS: CorsOptions = {
    preferredOrigin: IS_PROD ? CORS_DOMAIN : '*',
    supportedMethods: ['POST', 'OPTIONS']
};

export const POST: APIRoute = async ({ request, redirect }) => {
    const form = await request.formData();

    const email = form.get('email')?.toString();
    const password = form.get('password')?.toString();
    const captchaToken = form.get('captchaToken')?.toString();

    if (!email || !password || !captchaToken) {
        return withCors(request, redirect(`/signup?error=${encodeURIComponent('Missing email, password or token')}`), CORS);
    }

    const successCaptcha = await validateCaptcha(captchaToken, import.meta.env.HCAPTCHA_SECRET_KEY);

    if (!successCaptcha) {
        return withCors(request, redirect(`/signup?error=${encodeURIComponent('Failed to validate captcha')}`), CORS);
    }
    
    const { error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
    });

    if (signUpError) {
        return withCors(request, redirect(`/signup?error=${encodeURIComponent(signUpError.message)}`), CORS);
    }
    
    return withCors(request, redirect('/login?checkEmail=true'), CORS);
}