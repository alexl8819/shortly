import type { APIRoute } from "astro";
import { nanoid } from 'nanoid';
import decamelizeKeys from 'decamelize-keys';
import { supabaseClient } from "../../lib/client";
import camelcaseKeys from "camelcase-keys";

export const GET: APIRoute = async ({ request }) => {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return new Response('Unauthorized', { status: 401 });
    }

    const queryParams = new URL(request.url).searchParams;
    const index = queryParams.get('index');

    if (!index) {
        return new Response(JSON.stringify({
            error: 'Must defined an index'
        }), { status: 400 });
    }

    const offset = parseInt(index as string) || 0;

    const { data, error } = await supabaseClient.rpc('get_links_with_count', {
        'p_limit': 10,
        'p_offset': offset,
        'userid': userData.user.id
    });
    
    if (error) {
        console.error(error);
        return new Response(null, { status: 500 });
    }

    let rows: Array<any> = [];
    let totalRows: number | null = null;

    if (data.length) {
        rows = data.map((row: any) => {
            row = camelcaseKeys(row);
            if (!totalRows) {
                totalRows = row.totalRows;
            }
            const { totalRows: tRows, ...otherKeys } = row;
            return Object.assign({}, otherKeys);
        });
    }

    return new Response(JSON.stringify({ totalRows, rows }), { status: 200 });
}

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
        userId: data.user.id
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
  