import { FLARE_API_KEY, FLARE_APP_ID, FLARE_INTERNAL_SERVER_URL, FLARE_SERVER_URL } from "@/flare";
import { createCsrfProxy } from "@zuzjs/flare";
import { NextResponse } from "next/server";

const proxyHandler = createCsrfProxy({
	endpoint: FLARE_INTERNAL_SERVER_URL ?? FLARE_SERVER_URL,
	appId: FLARE_APP_ID,
	apiKey: FLARE_API_KEY,
});

export const GET = async (req: Request): Promise<Response> => {
	const proxied = await proxyHandler(req);
	const url = new URL(req.url);
	const next = url.searchParams.get("next");

    if (!next) {
		return proxied;
	}

	const redirectTarget = new URL(next, url.origin);
	const redirect = NextResponse.redirect(redirectTarget);
	const setCookie = proxied.headers.get("set-cookie");

	if (setCookie) {
		redirect.headers.set("set-cookie", setCookie);
	}

	return redirect;
};