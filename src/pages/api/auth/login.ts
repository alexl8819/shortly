import type { APIRoute } from "astro";

import { supabaseClient } from "../../../lib/client";
import decamelizeKeys from "decamelize-keys";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const form = await request.formData();

    const email = form.get('email')?.toString();
    const password = form.get('password')?.toString();

    if (!email || !password) {
        return redirect(`/login?error=${encodeURIComponent('Missing email or password')}`);
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    const { data: userCreatedData, error: userCreatedError } = await supabaseClient.from('Users').select('id').eq('user_id', data.user.id);

    if (userCreatedError) {
        console.error(userCreatedError);
        return new Response(null, { status: 500 });
    }

    console.log(userCreatedData);

    if (!userCreatedData || !userCreatedData.length) {
        const { error: userError } = await supabaseClient.from('Users').insert(decamelizeKeys({
            userId: data.user.id
        }));

        if (userError) {
            console.error(userError);
            return redirect(`/login?error=${encodeURIComponent('Unable to create user at this time. Please try again later.')}`)
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

    return redirect('/dashboard');
}