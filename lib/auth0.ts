import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { db } from "@/app/db";
import { Users } from "@/app/db/schema";

export const auth0 = new Auth0Client({
  beforeSessionSaved: async (session) => {
    interface Auth0User {
      sub?: string;
      email?: string;
      name?: string;
      nickname?: string;
      picture?: string;
      [key: string]: unknown;
    }
    const user = session.user as Auth0User | undefined;
    const id = user?.sub as string | undefined;
    if (!id) return session;

    const email = (user?.email as string | undefined) ?? "";
    const name = (user?.name as string | undefined) ?? (user?.nickname as string | undefined) ?? null;
    const picture = (typeof user?.picture === "string" ? (user?.picture as string) : undefined) ?? null;

    await db
      .insert(Users)
      .values({ id, email, name, picture, updatedAt: new Date() })
      .onConflictDoUpdate({ target: Users.id, set: { email, name, picture, updatedAt: new Date() } });

    return session;
  },
});