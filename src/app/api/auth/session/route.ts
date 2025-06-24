import { SessionData, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// セッション情報の取得
export const GET = async () => {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (session.isLoggedIn && session.userName) {
    return NextResponse.json({
      isLoggedIn: true,
      user: { username: session.userName }
    });
  } else {
    return NextResponse.json({
      isLoggedIn: false,
      user: null
    });
  }
};