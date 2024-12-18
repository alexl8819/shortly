import { type APIRoute } from "astro";
import camelcaseKeys from "camelcase-keys";
import dayjs from 'dayjs';
import { supabaseClient } from "../../../lib/client";

export const GET: APIRoute = async ({ params }) => {
    const { error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return new Response('Unauthorized', { status: 401 });
    }

    if (!params.id) {
        return new Response(JSON.stringify({
            error: 'Missing required id'
        }), { status: 400 });
    }

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
    `).eq('link', params.id);

    if (error) {
        console.error(error);
        return new Response(null, { status: 500 });
    }

    // If no analytics are found, display the short id and original_url
    if (!data.length) {
        const { data, error } = await supabaseClient.from('Links').select('short_id,original_url').eq('id', params.id);
        
        if (error) {
            console.error(error);
            return new Response(null, { status: 500 });
        }
        
        return new Response(JSON.stringify({
            total: 0,
            rows: camelcaseKeys(data)
        }), { status: 200 });
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

    return new Response(JSON.stringify({
        total,
        rows: modifiedRows
    }), { status: 200 });
} 