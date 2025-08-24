import { Auth0Client } from "@auth0/nextjs-auth0/server";

import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
	async onCallback(error: unknown, context: Record<string, unknown>, session: Record<string, unknown> | null) {
		if (error) {
			console.error("Authentication error:", error);
			return NextResponse.redirect(
				new URL("/error", process.env.APP_BASE_URL || "http://localhost:3000")
			);
		}

		// Custom logic after successful authentication
			if (session) {
				try {
					console.log("User logged in successfully:", JSON.stringify(session));
				} catch {
					// ignore JSON errors
				}
			}

			const returnTo = (context as { returnTo?: string })?.returnTo || "/";
			return NextResponse.redirect(
				new URL(String(returnTo), process.env.APP_BASE_URL || "http://localhost:3000")
			);
	}
});