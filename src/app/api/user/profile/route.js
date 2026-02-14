import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Handles Preflight for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Handles fetching the user data (Fixes the Loading error)
export async function GET(req) {
  const user = verifyJWT(req); //
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: corsHeaders }
    ); //
  }

  try {
    const client = await getClientPromise(); //
    const db = client.db("wad-01"); //
    const profile = await db.collection("user").findOne(
      { email: user.email },
      { projection: { password: 0 } } // Safety: don't send password
    ); //

    if (!profile) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(profile, { status: 200, headers: corsHeaders }); //
  } catch (err) {
    return NextResponse.json(
      { message: err.toString() },
      { status: 500, headers: corsHeaders }
    ); //
  }
}