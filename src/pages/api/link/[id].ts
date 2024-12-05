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

    let row;

    if (data.length) {
        console.log(data);
        row = camelcaseKeys(data[0]);
    }

    if (!row) {
        return new Response(JSON.stringify({
            error: 'Failed to retrieve url'
        }));
    }

    return redirect(row.originalUrl);
}