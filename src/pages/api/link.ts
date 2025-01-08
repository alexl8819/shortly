import type { APIRoute } from "astro";
import { nanoid } from 'nanoid';
import decamelizeKeys from 'decamelize-keys';
import camelcaseKeys from "camelcase-keys";

import { supabaseClient } from "../../lib/client";
import { type CorsOptions, getClientIP, isURLActive, withCors } from "../../lib/common";
import { GENERIC_ERROR_MESSAGE, QUERY_LIMIT, VALID_URL } from "../../lib/constants";
import { sanitize } from "../../lib/common";
import { ratelimiter } from "../../lib/ratelimiter";

const IS_PROD = import.meta.env.PROD;
const CORS_DOMAIN = import.meta.env.PUBLIC_CORS_DOMAIN;

const CORS: CorsOptions = {
    preferredOrigin: IS_PROD ? CORS_DOMAIN : '*',
    supportedMethods: ['GET', 'POST', 'OPTIONS']
};

export const GET: APIRoute = async ({ request }) => {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return withCors(request, new Response('Unauthorized', { status: 401 }), CORS);
    }

    const { headers } = request;

    const sourceAddress = getClientIP(headers);

    if (!sourceAddress) {
        return withCors(request, new Response(JSON.stringify({
            error: GENERIC_ERROR_MESSAGE
        }), { status: 500 }), CORS);
    }

    const shouldBackoff = await ratelimiter.shouldLimit(sourceAddress);
    
    if (shouldBackoff) {
        return withCors(request, new Response(JSON.stringify({
            error: 'Too many requests'
        }), { status: 429 }), CORS);
    }

    const queryParams = new URL(request.url).searchParams;
    const index = queryParams.get('index')?.toString();
    const limit = queryParams.get('limit')?.toString();

    if (!index) {
        return withCors(request, new Response(JSON.stringify({
            error: 'index must be defined'
        }), { status: 400 }), CORS);
    }

    const offset = parseInt(index as string) || 0;
    const _limit = parseInt(limit as string) || QUERY_LIMIT;

    const { data, error } = await supabaseClient.rpc('get_links_with_count', {
        'p_limit': _limit,
        'p_offset': offset,
        'userid': userData.user.id
    });
    
    if (error) {
        console.error(error);
        return withCors(request, new Response(JSON.stringify({
            error: GENERIC_ERROR_MESSAGE
        }), { status: 500 }), CORS);
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
            return withCors(request, new Response(JSON.stringify({
                error: GENERIC_ERROR_MESSAGE
            }), { status: 500 }), CORS);
        }

        const clicksMap = new Map(analyticsFound.map((r: any) => [r.linkid, r.clicks]));

        rows = rows.map((row: any) => Object.assign({}, row, {
            clicks: clicksMap.get(row.id) || 0
        }));
    }

    return withCors(request, new Response(JSON.stringify({ totalRows, rows }), { status: 200 }), CORS);
}

export const POST: APIRoute = async ({ request }) => {
    const { data, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return withCors(request, new Response('Unauthorized', { status: 401 }), CORS);
    }

    const { headers } = request;

    const sourceAddress = getClientIP(headers);

    if (!sourceAddress) {
        return withCors(request, new Response(JSON.stringify({
            error: GENERIC_ERROR_MESSAGE
        }), { status: 500 }), CORS);
    }

    const shouldBackoff = await ratelimiter.shouldLimit(sourceAddress);
    
    if (shouldBackoff) {
        return withCors(request, new Response(JSON.stringify({
            error: 'Too many requests'
        }), { status: 429 }), CORS);
    }

    const submitted = await request.json();

    const originalUrl = sanitize(submitted.originalUrl);

    if (!originalUrl) {
        return withCors(request, new Response(JSON.stringify({
            error: 'URL is missing'
        }), { status: 400 }), CORS);
    }

    if (!VALID_URL.test(originalUrl)) {
        return withCors(request, new Response(JSON.stringify({
            error: 'URL is not a valid URL'
        }), { status: 400 }), CORS);
    }

    const urlStatus = await isURLActive(originalUrl);

    if (!urlStatus) {
        return withCors(request, new Response(JSON.stringify({
            error: 'URL is inactive or dead'
        }), { status: 400 }), CORS);
    }

    const { count, error: countErr } = await supabaseClient.from('Links').select('id', { 
        count: 'exact', head: true 
    }).eq('original_url', originalUrl).eq('user_id', data.user.id);

    if (countErr) {
        console.error(countErr);
        return withCors(request, new Response(JSON.stringify({
            error: GENERIC_ERROR_MESSAGE
        }), { status: 500 }), CORS);
    }

    if (count && count > 0) {
        return withCors(request, new Response(JSON.stringify({
            error: 'URL already exists'
        }), { status: 400 }), CORS);
    }

    const shortId = nanoid(6);

    const { error: sqlCreateError } = await supabaseClient.from('Links').insert(decamelizeKeys({
        originalUrl,
        shortId,
        userId: data.user.id
    }));

    if (sqlCreateError) {
        console.error(sqlCreateError);
        return withCors(request, new Response(JSON.stringify({
            error: GENERIC_ERROR_MESSAGE
        }), { status: 500 }), CORS);
    }

    return withCors(request, new Response(JSON.stringify({
        url: `${import.meta.env.REDIRECT_LINK_DOMAIN}${shortId}`
    }), { status: 200 }), CORS);
}
  