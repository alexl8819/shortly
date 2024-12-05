export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies }) => {
    if (!cookies.has('sb-access-token') || !cookies.has('sb-refresh-token')) {
        return new Response(JSON.stringify({
            error: 'Bad request'
        }), { status: 400 });
    }

    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    return new Response(null, { status: 204 });
}