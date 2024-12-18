import type { APIRoute } from "astro";
import camelcaseKeys from 'camelcase-keys';
import { UAParser, type UAParserExt, type UAParserProps } from 'ua-parser-js';
import { Crawlers, CLIs, Emails } from 'ua-parser-js/extensions';
import { isBot, isAIBot } from 'ua-parser-js/helpers';
import { supabaseClient } from "../../../lib/client";
import decamelizeKeys from "decamelize-keys";
import { VALID_URL } from "../../../lib/constants";

export const DELETE: APIRoute = async ({ params }) => {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { id: shortId } = params;

    const { error: delError } = await supabaseClient.from('Links').delete().eq('short_id', shortId).eq('user_id', userData.user.id);

    if (delError) {
        console.error(delError);
        return new Response(JSON.stringify({
            error: 'Failed to delete link'
        }), { status: 500 });
    }

    return new Response(null, { status: 204 });
}

export const PATCH: APIRoute = async ({ request }) => {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return new Response('Unauthorized', { status: 401 });
    }

    const form = await request.formData();
    const shortId = form.get('shortId')?.toString();
    const newUrl = form.get('new')?.toString();

    if (!newUrl) {
        return new Response(JSON.stringify({
            error: 'Missing updated URL'
        }), { status: 400 });
    }

    if (!VALID_URL.test(newUrl)) {
        return new Response(JSON.stringify({
            error: 'Invalid URL provided'
        }), { status: 400 });
    }

    const { error } = await supabaseClient.from('Links').update(decamelizeKeys({
        originalUrl: newUrl
    })).eq('short_id', shortId).eq('user_id', userData.user.id);

    if (error) {
        console.error(error);
        return new Response(null, { status: 500 });
    }

    return new Response(null, { status: 200 });
}

export const GET: APIRoute = async ({ request, params, redirect }) => {
    const { id: shortId } = params;
    const { headers } = request;
    // TODO: use cache
    const { data, error } = await supabaseClient.from('Links').select('id,original_url').eq('short_id', shortId).limit(1);

    if (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), { status: 500 });
    }

    let row;

    if (data.length) {
        row = camelcaseKeys(data[0]);
    } else if (!row) {
        return redirect('/404');
    }

    const sourceAddress = headers.get('x-forwarded-for') || headers.get('cf-connecting-ip') || headers.get('x-real-ip');
    const userAgent = headers.get('user-agent');
    const referer = headers.get('referer');

    // TODO: should probably be moved to Analytics as a long running fn?
    if (sourceAddress) {
        const { data, error } = await supabaseClient.from('Geolocation').select('id').eq('ip_address', sourceAddress);
        
        if (error) {
            console.error(error);
            return new Response(null, {
                status: 500
            })
        }

        // If no entry exists for this ip address, add its initial data
        if (!data || !data.length) {
            const metadata = await getAddressMetadata(sourceAddress);

            if (metadata) {
                const { error: geoError } =  await supabaseClient.from('Geolocation').insert(decamelizeKeys({
                    country: metadata.location.originCountry,
                    state: metadata.location.originState || null,
                    city: metadata.location.originCity || null,
                    fingerprint: metadata.confidence >= 0.5 ? metadata.fingerprint : null,
                    ipAddress: sourceAddress
                }));

                if (geoError) {
                    console.error(geoError);
                    return new Response(null, {
                        status: 500
                    });
                }
            }
        }
    }

    if (userAgent) {
        const { data, error: devicesError } = await supabaseClient.from('Devices').select('id').eq('user_agent', userAgent);
        
        if (devicesError) {
            console.error(devicesError);
            return new Response(null, { status: 500 });
        }

        if (!data || !data.length) {
            const result = await UAParser(userAgent, [CLIs, Emails, Crawlers] as UAParserExt).withFeatureCheck();
        
            const isBotLike = isAIBot(result) || isBot(result);

            const { type: browserType, name, version } = result.browser;
            const { type: deviceType, vendor, model } = result.device;

            const usedType = deviceType || name;

            const { error: userAgentError } = await supabaseClient.from('Devices').insert(decamelizeKeys({
                userAgent,
                isAutomated: isBotLike,
                type: usedType,
                interface: browserType,
                model,
                vendor,
                version
            }));

            if (userAgentError) {
                console.error(userAgentError);
                return new Response(null, {
                    status: 500
                });
            }
        }
    }

    // Track UTM params from original URL
    const urlParams = new URL(row.originalUrl).searchParams;

    const utmSource = urlParams.get('utm_source')?.toString();
    const utmMedium = urlParams.get('utm_medium')?.toString();
    const utmCampaign = urlParams.get('utm_campaign')?.toString();
    const utmTerm = urlParams.get('utm_term')?.toString();
    const utmContent = urlParams.get('utm_content')?.toString();

    const { error: analyicsError } = await supabaseClient.from('Analytics').insert(decamelizeKeys({
        link: row.id,
        sourceAddress,
        referer,
        userAgent,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent
    }));

    if (analyicsError) {
        console.error(analyicsError);
        return new Response(null, {
            status: 500
        });
    }

    return redirect(row.originalUrl);
}

interface AddressMetadata {
    location: {
        originCountry: string,
        originState?: string,
        originCity?: string
    },
    targetIp: string,
    fingerprint: string,
    confidence: number
}

async function getAddressMetadata (sourceAddress: string): Promise<AddressMetadata | null> {
    let addressResponse;
    
    try {
        addressResponse = await fetch(
            `${import.meta.env.IP_LOOKUP_API}identify?ip=${sourceAddress}`,
            {
                headers: {
                    [import.meta.env.IP_LOOKUP_API_HEADER_KEY]: import.meta.env.IP_LOOKUP_API_HEADER_VALUE
                },
                method: 'GET'
            }
        );
    } catch (err) {
        console.error(err);
        return null;
    }

    if (addressResponse && !addressResponse.ok) {
        return null;
    }

    return await addressResponse.json();
}