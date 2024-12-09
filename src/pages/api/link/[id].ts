import type { APIRoute } from "astro";
import camelcaseKeys from 'camelcase-keys';
import { UAParser, type UAParserExt, type UAParserProps } from 'ua-parser-js';
import { Crawlers, CLIs, Emails } from 'ua-parser-js/extensions';
import { isBot, isAIBot } from 'ua-parser-js/helpers';
import { supabaseClient } from "../../../lib/client";
import decamelizeKeys from "decamelize-keys";

export const GET: APIRoute = async ({ request, params, redirect }) => {
    const { id } = params;
    const { headers } = request;
    // TODO: use cache
    const { data, error } = await supabaseClient.from('Links').select('id,original_url').eq('short_id', id).limit(1);

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
    const referrer = headers.get('referrer');

    // TODO: should probably be moved to Analytics as a long running fn?
    if (sourceAddress) {
        const { data, error } = await supabaseClient.from('Geolocation').select('id').eq('ip_address', sourceAddress).limit(1);
        
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
                const { error: geoError } =  await supabaseClient.from('Geolocation').insert({
                    country: metadata.location.originCountry,
                    state: metadata.location.originState || null,
                    city: metadata.location.originCity || null,
                    fingerprint: metadata.confidence >= 0.5 ? metadata.fingerprint : null
                });

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
        const result = await UAParser(userAgent, [CLIs, Emails, Crawlers] as UAParserExt).withFeatureCheck();
        
        const isBotLike = isAIBot(result) || isBot(result);

        const { type: browserType, /*name, version*/ } = result.browser;
        const { type: deviceType, vendor, model } = result.device;

        const { error: userAgentError } = await supabaseClient.from('Devices').insert(decamelizeKeys({
            isAutomated: isBotLike,
            type: deviceType,
            interface: browserType,
            model,
            vendor
        }));

        if (userAgentError) {
            console.error(userAgentError);
            return new Response(null, {
                status: 500
            });
        }
    }

    const { error: analyicsError } = await supabaseClient.from('Analytics').insert({
        link: row.id,
        sourceAddress,
        referrer,
        userAgent
    });

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
            `${import.meta.env.IP_LOOKUP_API}/identify?ip=${sourceAddress}`,
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

    if (addressResponse && addressResponse.status !== 200) {
        return null;
    }

    return await addressResponse.json();
}