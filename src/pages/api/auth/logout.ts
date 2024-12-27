import type { APIRoute } from "astro";
import { supabaseClient } from "../../../lib/client";
import { type CorsOptions, withCors } from "../../../lib/common";

const IS_PROD = import.meta.env.prod;
const CORS_DOMAIN = import.meta.env.PUBLIC_CORS_DOMAIN;

const CORS: CorsOptions = {
    preferredOrigin: IS_PROD ? CORS_DOMAIN : '*',
    supportedMethods: ['POST', 'OPTIONS']
};

export const POST: APIRoute = async ({ request, cookies }) => {
    if (!cookies.has('sb-access-token') || !cookies.has('sb-refresh-token')) {
        return withCors(request, new Response(JSON.stringify({
            error: 'Bad request'
        }), { status: 400 }), CORS);
    }

    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    const { error: signOutError } = await supabaseClient.auth.signOut();

    if (signOutError) {
        return withCors(request, new Response(JSON.stringify({
            error: signOutError.message
        }), { status: 500 }), CORS);
    }

    return withCors(request, new Response(null, { status: 204 }), CORS);
}