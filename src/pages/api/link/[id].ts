import type { APIRoute } from "astro";
import camelcaseKeys from 'camelcase-keys';
import { UAParser, type UAParserExt } from 'ua-parser-js';
import { Crawlers, CLIs, Emails } from 'ua-parser-js/extensions';
import { isBot, isAIBot } from 'ua-parser-js/helpers';
import decamelizeKeys from "decamelize-keys";
import dayjs from "dayjs";

import { supabaseClient } from "../../../lib/client";
import { MINIMUM_MINUTE_DIFF, VALID_URL } from "../../../lib/constants";
import { type CorsOptions, hasExpired, withCors, sanitize } from "../../../lib/common";

const IS_PROD = import.meta.env.PROD;
const CORS_DOMAIN = import.meta.env.PUBLIC_CORS_DOMAIN;

const CORS: CorsOptions = {
    preferredOrigin: IS_PROD ? CORS_DOMAIN : '*',
    supportedMethods: ['PATCH', 'DELETE', 'OPTIONS']
};

const VALID_PATCH_OPS = ['url', 'expiry'];

export const DELETE: APIRoute = async ({ request, params }) => {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return withCors(request, new Response('Unauthorized', { status: 401 }), CORS);
    }

    const { id: shortId } = params;

    const { error: delError } = await supabaseClient.from('Links').delete().eq('short_id', shortId).eq('user_id', userData.user.id);

    if (delError) {
        console.error(delError);
        return withCors(request, new Response(JSON.stringify({
            error: 'Failed to delete link'
        }), { status: 500 }), CORS);
    }

    return withCors(request, new Response(null, { status: 204 }), CORS);
}

export const PATCH: APIRoute = async ({ request }) => {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
        return withCors(request, new Response('Unauthorized', { status: 401 }), CORS);
    }

    const submitted = await request.json();
    const shortId = sanitize(submitted.shortId);

    if (!shortId) {
        return withCors(request, new Response(JSON.stringify({
            error: 'Missing shortId'
        }), { status: 400 }), CORS);
    }

    const field = sanitize(submitted.field);

    if (!field || (field && VALID_PATCH_OPS.indexOf(field) === -1)) {
        return withCors(request, new Response(JSON.stringify({
            error: 'Field must be provided'
        })), CORS);
    }
    
    if (field === 'expiry') {
        const expiry = sanitize(submitted.expiry);

        if (!expiry) {
            return withCors(request, new Response(JSON.stringify({
                error: 'Missing expiration datetime'
            }), { status: 400 }), CORS);
        }

        const futureDate = dayjs(expiry);
        const currentDate = dayjs();

        if (futureDate.isAfter(currentDate, 'minute') && futureDate.diff(currentDate, 'minute') < MINIMUM_MINUTE_DIFF) {
            return withCors(request, new Response(JSON.stringify({
                error: 'Invalid expiration date'
            }), { status: 400 }), CORS);
        }
    
        const { error } = await supabaseClient.from('Links').update(decamelizeKeys({
            expiresAt: expiry
        })).eq('short_id', shortId).eq('user_id', userData.user.id);
    
        if (error) {
            console.error(error);
            return withCors(request, new Response(null, { status: 500 }), CORS);
        }
    } else if (field === 'url') {
        const newUrl = sanitize(submitted.newUrl);
        
        if (!newUrl) {
            return withCors(request, new Response(JSON.stringify({
                error: 'Missing updated URL'
            }), { status: 400 }), CORS);
        }
    
        if (!VALID_URL.test(newUrl)) {
            return withCors(request, new Response(JSON.stringify({
                error: 'Invalid URL provided'
            }), { status: 400 }), CORS);
        }
    
        const { error } = await supabaseClient.from('Links').update(decamelizeKeys({
            originalUrl: newUrl
        })).eq('short_id', shortId).eq('user_id', userData.user.id);
    
        if (error) {
            console.error(error);
            return withCors(request, new Response(null, { status: 500 }), CORS);
        }
    }

    return withCors(request, new Response(null, { status: 200 }), CORS);
}

const customCors: CorsOptions = {
    supportedMethods: ['GET', 'OPTIONS']
}

export const GET: APIRoute = async ({ request, params, redirect }) => {
    const { id: shortId } = params;
    const { headers } = request;

    if (shortId === 'robots.txt') {
        return withCors(request, new Response(null, { status: 401 }), customCors);
    }

    // TODO: use cache
    const { data, error } = await supabaseClient.from('Links').select('id,original_url,expires_at').eq('short_id', shortId).limit(1);

    if (error) {
        return withCors(request, new Response(JSON.stringify({
            error: error.message
        }), { status: 500 }), customCors);
    }

    if (!data) {
        return withCors(request, redirect('/404'), customCors);
    }

    const row = camelcaseKeys(data[0]);

    if (row.expiresAt && hasExpired(row.expiresAt)) {
        return withCors(request, redirect('/404'), customCors);
    }

    const sourceAddress = headers.get('x-forwarded-for') || headers.get('cf-connecting-ip') || headers.get('x-real-ip');
    const userAgent = headers.get('user-agent');
    const referer = headers.get('referer');

    if (sourceAddress) {
        const { data, error } = await supabaseClient.from('Geolocation').select('id').eq('ip_address', sourceAddress);
        
        if (error) {
            console.error(error);
            return withCors(request, new Response(null, {
                status: 500
            }), customCors);
        }

        // TODO: should probably be cron job?
        // WARNING: Possible race condition
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
                    return withCors(request, new Response(null, {
                        status: 500
                    }), customCors);
                }
            }
        }
    }

    if (userAgent) {
        const { data, error: devicesError } = await supabaseClient.from('Devices').select('id').eq('user_agent', userAgent);
        
        if (devicesError) {
            console.error(devicesError);
            return withCors(request, new Response(null, { status: 500 }), customCors);
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
                return withCors(request, new Response(null, {
                    status: 500
                }), customCors);
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
        return withCors(request, new Response(null, {
            status: 500
        }), customCors);
    }

    return withCors(request, redirect(row.originalUrl), customCors);
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