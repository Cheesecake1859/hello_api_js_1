import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const users = await db.collection("user").find({}).toArray();
    return NextResponse.json(users, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { message: error.toString() },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Incoming Data:", data);

    if (!data.username || !data.email || !data.password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("user").insertOne({
      username: data.username,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      firstname: data.firstname || "",
      lastname: data.lastname || "",
      status: "ACTIVE",
    });

    return NextResponse.json(
      { id: result.insertedId },
      { status: 200, headers: corsHeaders }
    );
  } catch (exception) {
    console.error("Post Error:", exception);
    return NextResponse.json(
      { message: "Database Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * EDIT user (recommended: pass id as query param)
 * Example: PUT /api/user?id=USER_ID
 * Body can include: username, email, firstname, lastname, status, password (optional)
 */
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Missing id in query (?id=...)" },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await req.json();

    // Only allow these fields to be updated
    const update = {};
    if (data.username !== undefined) update.username = data.username;
    if (data.email !== undefined) update.email = data.email;
    if (data.firstname !== undefined) update.firstname = data.firstname;
    if (data.lastname !== undefined) update.lastname = data.lastname;
    if (data.status !== undefined) update.status = data.status;

    // If password is included, hash it
    if (data.password !== undefined && data.password !== "") {
      update.password = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Updated", modifiedCount: result.modifiedCount },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Put Error:", error);
    return NextResponse.json(
      { message: "Database Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE user (pass id as query param)
 * Example: DELETE /api/user?id=USER_ID
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Missing id in query (?id=...)" },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("user").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Deleted" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { message: "Database Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
