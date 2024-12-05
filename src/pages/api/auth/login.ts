export const prerender = false;

import type { APIRoute } from "astro";

import { supabaseClient } from "../../../lib/client";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const form = await request.formData();

    const email = form.get('email')?.toString();
    const password = form.get('password')?.toString();

    if (!email || !password) {
        return new Response(JSON.stringify({
            error: 'Missing email or password'
        }), {status: 400});
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), { status: 500 });
    }

    const { access_token, refresh_token } = data.session;

    cookies.set('sb-access-token', access_token, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
    });
    cookies.set('sb-refresh-token', refresh_token, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
    });

    return redirect('/dashboard');
}