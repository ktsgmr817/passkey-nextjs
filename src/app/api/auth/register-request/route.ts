import { SessionData, sessionOptions } from "@/lib/session";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const FIVE_MINUTES = 5 * 60 * 1000;

// パスキー作成リクエストの生成
export const POST = async (req: NextRequest) => {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const body = await req.json();
  if (!body.userName) {
    return NextResponse.json(
      { error: "userName is required." },
      { status: 400 },
    );
  }

  const options = await generateRegistrationOptions({
    rpName: "Passkey Nextjs",
    rpID: process.env.RP_ID!,
    userName: body.userName,
    timeout: FIVE_MINUTES,
    excludeCredentials: [],
  });
  
  session.userName = body.userName;
  session.challenge = options.challenge;
  await session.save();
  return NextResponse.json(options);
};
