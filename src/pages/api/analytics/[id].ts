import { type APIRoute } from "astro";
import camelcaseKeys from "camelcase-keys";
import dayjs from 'dayjs';
import { supabaseClient } from "../../../lib/client";
import { type CorsOptions, withCors } from "../../../lib/common";

const IS_PROD = import.meta.env.PROD;
const CORS_DOMAIN = import.meta.env.PUBLIC_CORS_DOMAIN;

const CORS: CorsOptions = {
    preferredOrigin: IS_PROD ? CORS_DOMAIN : '*',
    supportedMethods: ['GET', 'OPTIONS']
};

export const GET: APIRoute = async ({ request, params }) => {
    const { error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return withCors(request, new Response('Unauthorized', { status: 401 }), CORS);
    }

    if (!params.id) {
        return withCors(request, new Response(JSON.stringify({
            error: 'Missing required id'
        }), { status: 400 }), CORS);
    }

    const searchParams = new URL(request.url).searchParams;

    const offset = searchParams.get('offset')?.toString();
    const limit = searchParams.get('limit')?.toString();

    if (!limit || !offset) {
        return withCors(request, new Response(JSON.stringify({
            error: 'Offset or Limit is missing'
        }), { status: 400 }), CORS);
    }

    const _limit = parseInt(limit);
    const _offset = parseInt(offset);

    const { data, error } = await supabaseClient.from('Analytics').select(`
        created_at,
        Links (
            short_id,
            original_url
        ),
        Geolocation (
            ip_address,
            country,
            state,
            city,
            fingerprint
        ),
        Devices (
            vendor,
            type,
            model,
            version,
            interface,
            is_automated
        ),
        referer
    `).eq('link', params.id).range((_offset - _limit), (_offset + _limit));

    if (error) {
        console.error(error);
        return withCors(request, new Response(null, { status: 500 }), CORS);
    }

    // If no analytics are found, display the short id and original_url
    if (!data.length) {
        const { data, error } = await supabaseClient.from('Links').select('short_id,original_url').eq('id', params.id);
        
        if (error) {
            console.error(error);
            return withCors(request, new Response(null, { status: 500 }), CORS);
        }
        
        return withCors(request, new Response(JSON.stringify({
            total: 0,
            rows: camelcaseKeys(data)
        }), { status: 200 }), CORS);
    }

    const { count: total } = await supabaseClient.from('Analytics').select('*', { count: 'exact', head: true }).eq('link', params.id);

    const modifiedRows = data.map((dp: any) => {
        const { Links, ...otherKeys } = dp;
        return camelcaseKeys(Object.assign({}, otherKeys, {
            created_at: dayjs(dp.created_at),
            short_id: dp.Links.short_id,
            original_url: dp.Links.original_url,
            Geolocation: camelcaseKeys(Object.assign({}, dp.Geolocation, {
                ipAddress: dp.Geolocation.ip_address.replace(/(\d+).(\d+)$/g, '*.*')
            })),
            Devices: camelcaseKeys(dp.Devices)
        })); 
    });

    return withCors(request, new Response(JSON.stringify({
        total,
        rows: modifiedRows
    }), { status: 200 }), CORS);
} 