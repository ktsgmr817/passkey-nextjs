import { SessionData, sessionOptions } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const FIVE_MINUTES = 5 * 60 * 1000;

// パスキーログインリクエストの生成
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

  try {
    // ユーザーの既存のパスキーを取得
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", body.userName)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const { data: credentials, error: credError } = await supabase
      .from("user_credentials")
      .select("credential_id")
      .eq("user_id", userData.id);

    if (credError) {
      console.error("Credential fetch error:", credError);
      return NextResponse.json(
        { error: "Failed to fetch credentials" },
        { status: 500 },
      );
    }

    const allowCredentials = credentials.map((cred) => ({
      id: Buffer.from(cred.credential_id, 'base64'),
      type: 'public-key' as const,
    }));

    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID!,
      timeout: FIVE_MINUTES,
      allowCredentials,
    });

    session.userName = body.userName;
    session.challenge = options.challenge;
    await session.save();

    return NextResponse.json(options);
  } catch (error) {
    console.error("Login request error:", error);
    return NextResponse.json(
      { error: "Failed to generate login options" },
      { status: 500 },
    );
  }
};