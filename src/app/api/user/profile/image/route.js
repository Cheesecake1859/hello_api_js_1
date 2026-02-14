import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req) {
  const user = verifyJWT(req); //
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders }); //
  }

  try {
    const formData = await req.formData(); //
    const file = formData.get("file"); //

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400, headers: corsHeaders }); //
    }

    const ext = file.name.split(".").pop(); //
    const filename = uuidv4() + "." + ext; //
    const savePath = path.join(process.cwd(), "public", "profile-images", filename); //

    const arrayBuffer = await file.arrayBuffer(); //
    await fs.writeFile(savePath, Buffer.from(arrayBuffer)); //

    const client = await getClientPromise(); //
    const db = client.db("wad-01"); //
    await db.collection("user").updateOne(
      { email: user.email },
      { $set: { profileImage: `/profile-images/${filename}` } }
    ); //

    return NextResponse.json({ imageUrl: `/profile-images/${filename}` }, { status: 200, headers: corsHeaders }); //
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders }); //
  }
}

export async function DELETE(req) {
  const user = verifyJWT(req); //
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders }); //
  }
  try {
    const client = await getClientPromise(); //
    const db = client.db("wad-01"); //
    const userDoc = await db.collection("user").findOne({ email: user.email }); //

    if (userDoc?.profileImage) {
      const filePath = path.join(process.cwd(), "public", userDoc.profileImage);
      try { await fs.rm(filePath); } catch (e) { /* ignore if missing */ }
      await db.collection("user").updateOne({ email: user.email }, { $set: { profileImage: null } }); //
    }
    return NextResponse.json({ message: "OK" }, { status: 200, headers: corsHeaders }); //
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders }); //
  }
}