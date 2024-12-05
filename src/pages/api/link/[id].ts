export const prerender = false;

import type { APIRoute } from "astro";
import camelcaseKeys from 'camelcase-keys';
import { supabaseClient } from "../../../lib/client";

export const GET: APIRoute = async ({ params, redirect }) => {
    const { id } = params;
    // TODO: use cache
    const { data, error } = await supabaseClient.from('Links').select('original_url').eq('short_id', id);

    if (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), { status: 500 });
    }

    // TODO: collect analytics
    const { originalUrl } = camelcaseKeys(data[0]);

    return redirect(originalUrl);
}