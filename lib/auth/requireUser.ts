import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
}

/** Resolves the signed-in user from the server-side session, or null when the session is missing/expired. */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id || !user.email) return null;
  return { id: String(user.id), email: user.email, name: user.name ?? null };
}
