import { SessionData, sessionOptions } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// パスキーログインの検証
export const POST = async (req: NextRequest) => {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  const body = await req.json();

  if (!session.challenge || !session.userName) {
    return NextResponse.json(
      { error: "No login in progress" },
      { status: 400 },
    );
  }

  try {
    // ユーザーとパスキー情報を取得
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", session.userName)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const credentialID = Buffer.from(body.id, 'base64url');
    const { data: credentialData, error: credError } = await supabase
      .from("user_credentials")
      .select("*")
      .eq("user_id", userData.id)
      .eq("credential_id", Buffer.from(credentialID).toString('base64'))
      .single();

    if (credError || !credentialData) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 },
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: session.challenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN!,
      expectedRPID: process.env.RP_ID!,
      requireUserVerification: true,
      credential: {
        id: Buffer.from(credentialData.credential_id, 'base64').toString('base64url'),
        publicKey: Buffer.from(credentialData.public_key, 'base64'),
        counter: credentialData.counter,
      },
    });

    if (verification.verified) {
      // カウンターを更新
      if (verification.authenticationInfo.newCounter !== credentialData.counter) {
        await supabase
          .from("user_credentials")
          .update({ counter: verification.authenticationInfo.newCounter })
          .eq("id", credentialData.id);
      }

      // セッションにログイン情報を保存
      session.userName = session.userName;
      session.challenge = "";
      session.isLoggedIn = true;
      await session.save();

      return NextResponse.json({ 
        verified: true,
        user: { username: session.userName }
      });
    } else {
      return NextResponse.json(
        { error: "Authentication verification failed" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Login verification error:", error);
    return NextResponse.json(
      { error: "Authentication verification failed" },
      { status: 500 },
    );
  }
};