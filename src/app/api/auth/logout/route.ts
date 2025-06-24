import { SessionData, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ログアウト
export const POST = async () => {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  // セッションをクリア
  session.userName = "";
  session.challenge = "";
  session.isLoggedIn = false;
  await session.save();

  return NextResponse.json({ success: true });
};