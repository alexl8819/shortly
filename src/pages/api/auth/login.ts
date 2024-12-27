import type { APIRoute } from "astro";

import { supabaseClient } from "../../../lib/client";
import { type CorsOptions, withCors } from "../../../lib/common";
import decamelizeKeys from "decamelize-keys";

const IS_PROD = import.meta.env.prod;
const CORS_DOMAIN = import.meta.env.PUBLIC_CORS_DOMAIN;

const CORS: CorsOptions = {
    preferredOrigin: IS_PROD ? CORS_DOMAIN : '*',
    supportedMethods: ['POST', 'OPTIONS']
};

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const form = await request.formData();

    const email = form.get('email')?.toString();
    const password = form.get('password')?.toString();

    if (!email || !password) {
        return withCors(request, redirect(`/login?error=${encodeURIComponent('Missing email or password')}`), CORS);
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return withCors(request, redirect(`/login?error=${encodeURIComponent(error.message)}`), CORS);
    }

    const { data: userCreatedData, error: userCreatedError } = await supabaseClient.from('Users').select('id').eq('user_id', data.user.id);

    if (userCreatedError) {
        console.error(userCreatedError);
        return withCors(request, redirect(`/login?error=${encodeURIComponent('Something went wrong. Please try again later.')}`), CORS);
    }

    if (!userCreatedData || !userCreatedData.length) {
        const { error: userError } = await supabaseClient.from('Users').insert(decamelizeKeys({
            userId: data.user.id
        }));

        if (userError) {
            console.error(userError);
            return withCors(request, redirect(`/login?error=${encodeURIComponent('Unable to create user at this time. Please try again later.')}`), CORS);
        }
    }

    const { access_token, refresh_token } = data.session;

    cookies.set('sb-access-token', access_token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: import.meta.env.PROD,
        path: '/',
    });
    cookies.set('sb-refresh-token', refresh_token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: import.meta.env.PROD,
        path: '/',
    });

    return withCors(request, redirect('/dashboard'), CORS);
}