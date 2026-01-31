import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Explicitly allow all
    },
  });
}

// GET with Pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10; 
    const skip = (page - 1) * limit;

    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    // Get total count for pagination math
    const totalCount = await db.collection("item").countDocuments();
    const items = await db.collection("item").find({}).skip(skip).limit(limit).toArray();

    return NextResponse.json({ items, totalCount }, { headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}

// POST with required properties
export async function POST(req) {
  try {
    const data = await req.json();
    const client = await getClientPromise();
    const db = client.db("wad-01");

    // Mapping to criteria: itemName, itemCategory, itemPrice, status
    const result = await db.collection("item").insertOne({
      itemName: data.itemName,
      itemCategory: data.itemCategory,
      itemPrice: Number(data.itemPrice),
      status: "Available" 
    });

    return NextResponse.json({ id: result.insertedId }, { status: 200, headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}