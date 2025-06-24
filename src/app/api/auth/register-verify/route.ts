import { SessionData, sessionOptions } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// パスキー登録の検証
export const POST = async (req: NextRequest) => {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  const body = await req.json();

  if (!session.challenge || !session.userName) {
    return NextResponse.json(
      { error: "No registration in progress" },
      { status: 400 },
    );
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: session.challenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN!,
      expectedRPID: process.env.RP_ID!,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

      // ユーザーとパスキー情報をSupabaseに保存
      const { data: userData, error: userError } = await supabase
        .from("users")
        .upsert({
          username: session.userName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (userError) {
        console.error("User creation error:", userError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 },
        );
      }

      const { error: credentialError } = await supabase
        .from("user_credentials")
        .insert({
          user_id: userData.id,
          credential_id: Buffer.from(credentialID).toString('base64'),
          public_key: Buffer.from(credentialPublicKey).toString('base64'),
          counter: counter,
          created_at: new Date().toISOString(),
        });

      if (credentialError) {
        console.error("Credential creation error:", credentialError);
        return NextResponse.json(
          { error: "Failed to save credential" },
          { status: 500 },
        );
      }

      // セッションをクリア
      session.challenge = "";
      session.userName = "";
      await session.save();

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json(
        { error: "Registration verification failed" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Registration verification error:", error);
    return NextResponse.json(
      { error: "Registration verification failed" },
      { status: 500 },
    );
  }
};