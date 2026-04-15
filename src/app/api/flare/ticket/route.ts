/**
 * Issues a fresh one-time WebSocket auth ticket for the currently authenticated user.
 * Called by the Flare client on WebSocket reconnect so it can re-authenticate
 * without triggering a token refresh.
 *
 * GET /api/flare-ticket
 * Response: { ticket: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../auth";
import { flareAdmin } from "../../flareadmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const oauth = await requireUser(req);
    if (!oauth.hasSession) {
        return oauth.response;
    }

    const uid = oauth.user?.session?.uid;
    if (!uid) {
        return NextResponse.json({ error: "no_uid" }, { status: 401 });
    }

    try {
        const adminTicket = await flareAdmin.auth().getTicket(uid).catch((err) => null);
        return NextResponse.json({ ticket: adminTicket?.ticket ?? `ws:none` }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: "ticket_failed", message }, { status: 500 });
    }
}
