export const prerender = false;

import type { APIRoute } from "astro";
import { nanoid } from 'nanoid';
import decamelizeKeys from 'decamelize-keys';
import { supabaseClient } from "../../lib/client";

export const POST: APIRoute = async ({ request }) => {
    const { data, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return new Response('Unauthorized', { status: 401 });
    }

    const form = await request.formData();

    const originalUrl = form.get('originalUrl')?.toString();

    if (!originalUrl) {
        return new Response(JSON.stringify({
            error: 'Missing url'
        }), { status: 400 });
    }

    const shortId = nanoid(6);
    const insertBody = {
        originalUrl,
        shortId,
        userId: data.user?.id
    };

    const { error: sqlError } = await supabaseClient.from('Links').insert(decamelizeKeys(insertBody));

    if (sqlError) {
        return new Response(JSON.stringify({
            error: sqlError.message
        }), { status: 500 });
    }

    return new Response(JSON.stringify({
        url: `${import.meta.env.REDIRECT_LINK_DOMAIN}${shortId}`
    }), { status: 200 });
}
  