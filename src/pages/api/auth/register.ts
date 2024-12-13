import type { APIRoute } from "astro";

import { supabaseClient } from "../../../lib/client";
import { validateCaptcha } from "../../../lib/common";

export const POST: APIRoute = async ({ request, redirect }) => {
    const form = await request.formData();

    const email = form.get('email')?.toString();
    const password = form.get('password')?.toString();
    const captchaToken = form.get('captchaToken')?.toString();

    if (!email || !password || !captchaToken) {
        return redirect(`/signup?error=${encodeURIComponent('Missing email, password or token')}`);
    }

    const successCaptcha = await validateCaptcha(captchaToken, import.meta.env.HCAPTCHA_SECRET_KEY);

    if (!successCaptcha) {
        return redirect(`/signup?error=${encodeURIComponent('Failed to validate captcha')}`);
    }
    
    const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
    });

    if (signUpError) {
        return redirect(`/signup?error=${encodeURIComponent(signUpError.message)}`);
    }
    
    return redirect('/login?checkEmail=true');
}