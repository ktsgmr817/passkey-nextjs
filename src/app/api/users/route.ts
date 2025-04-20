import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const GET = async () => {
  const { data, error } = await supabase.from("test_table").select("*");

  if (error) {
    console.error("[Supabase Error]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
};
