import type { APIRoute } from "astro";
import { supabaseClient } from "../../../lib/client";

export const POST: APIRoute = async ({ cookies }) => {
    if (!cookies.has('sb-access-token') || !cookies.has('sb-refresh-token')) {
        return new Response(JSON.stringify({
            error: 'Bad request'
        }), { status: 400 });
    }

    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    const { error: signOutError } = await supabaseClient.auth.signOut();

    if (signOutError) {
        return new Response(JSON.stringify({
            error: signOutError.message
        }), { status: 500 });
    }

    return new Response(null, { status: 204 });
}