import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// Handles the browser security handshake (CORS Preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// EDIT logic
export async function PUT(req, { params }) {
  try {
    const { id } = params; // Captures ID from the [id] folder name
    const data = await req.json();
    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          username: data.username,
          firstname: data.firstname, 
          lastname: data.lastname, 
          email: data.email 
        } 
      }
    );
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}

// DELETE logic
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("user").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}