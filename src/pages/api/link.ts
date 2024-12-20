import type { APIRoute } from "astro";
import { nanoid } from 'nanoid';
import decamelizeKeys from 'decamelize-keys';
import camelcaseKeys from "camelcase-keys";

import { supabaseClient } from "../../lib/client";
import { QUERY_LIMIT, VALID_URL } from "../../lib/constants";

// TODO: cache non-volatile results
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
        'p_limit': QUERY_LIMIT,
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
        const ids: Array<number> = [];

        rows = data.map((row: any) => {
            row = camelcaseKeys(row);

            if (!totalRows) {
                totalRows = row.totalRows;
            }

            row.shortUrl = `${import.meta.env.REDIRECT_LINK_DOMAIN}${row.shortId}`;
            ids.push(row.id);

            const { totalRows: tRows, ...otherKeys } = row;
            return Object.assign({}, otherKeys);
        });

        const { data: analyticsFound, error } = await supabaseClient.rpc('count_clicks', {
            ids: ids.join(',')
        });
    
        if (error) {
            console.error(error);
            return new Response(null, { status: 500 });
        }

        const clicksMap = new Map(analyticsFound.map((r: any) => [r.linkid, r.clicks]));

        rows = rows.map((row: any) => Object.assign({}, row, {
            clicks: clicksMap.get(row.id) || 0
        }));
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

    if (!VALID_URL.test(originalUrl)) {
        return new Response(JSON.stringify({
            error: 'originalUrl is not a valid URL'
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
  