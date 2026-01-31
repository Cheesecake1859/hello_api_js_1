import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Updated OPTIONS to explicitly allow DELETE
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    },
  });
}

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const result = await db.collection("item").findOne({ _id: new ObjectId(id) });
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}

// Fixed PATCH to use required property names: itemName, itemCategory, itemPrice
export async function PATCH(req, { params }) {
  const { id } = await params;
  const data = await req.json();
  const partialUpdate = {};

  // Criteria Check: Mapping incoming generic names to specific requirements
  if (data.name !== undefined) partialUpdate.itemName = data.name;
  if (data.category !== undefined) partialUpdate.itemCategory = data.category;
  if (data.price !== undefined) partialUpdate.itemPrice = Number(data.price);
  if (data.status !== undefined) partialUpdate.status = data.status;

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const updatedResult = await db.collection("item").updateOne(
      { _id: new ObjectId(id) },
      { $set: partialUpdate }
    );
    return NextResponse.json(updatedResult, { status: 200, headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const data = await req.json();
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    // Ensure price is stored as a number even in PUT
    if (data.itemPrice) data.itemPrice = Number(data.itemPrice);

    const updatedResult = await db.collection("item").updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    return NextResponse.json(updatedResult, { status: 200, headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}

// ADDED DELETE METHOD (Fixes the "Method NOT ALLOWED" error)
export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    const result = await db.collection("item").deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(result, {
      status: 200,
      headers: corsHeaders
    });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { 
      status: 400, 
      headers: corsHeaders 
    });
  }
}