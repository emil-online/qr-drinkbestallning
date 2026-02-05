import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Category = "Cocktails" | "Beer" | "Wine" | "Mocktails" | "Shots";
type OrderStatus = "NY" | "PABORJAD" | "KLAR" | "UTLAMNAD";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const supabase = supabaseAdmin();
    const body = await req.json();

    const table = typeof body.table === "string" ? body.table : String(body.table ?? "");
    const orderNote = typeof body.orderNote === "string" ? body.orderNote : "";
    const lines = Array.isArray(body.lines) ? body.lines : [];

    if (!lines.length) return NextResponse.json({ error: "No lines" }, { status: 400 });

    // 1) Insert order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        status: "NY",
        table_label: table || null,
        order_note: orderNote || null,
      })
      .select("id, created_at, status, table_label, order_note")
      .single();

    if (orderErr) throw orderErr;

    // 2) Insert items
    const items = lines.map((l: any) => ({
      order_id: order.id,
      product_id: String(l.id),
      name: String(l.name),
      category: String(l.category),
      qty: Number(l.qty ?? 1),
      price: Number(l.price ?? 0),
      comment: typeof l.comment === "string" ? l.comment : null,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(items);
    if (itemsErr) throw itemsErr;

    return NextResponse.json({
      id: order.id,
      createdAt: order.created_at,
      status: order.status as OrderStatus,
      table: order.table_label ?? "",
      orderNote: order.order_note ?? "",
      lines,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        status,
        table_label,
        order_note,
        order_items (
          id,
          product_id,
          name,
          category,
          qty,
          price,
          comment
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const orders = (data ?? []).map((o: any) => ({
      id: o.id,
      createdAt: o.created_at,
      status: o.status as OrderStatus,
      table: o.table_label ?? "",
      orderNote: o.order_note ?? "",
      lines: (o.order_items ?? []).map((l: any) => ({
        id: l.product_id,
        name: l.name,
        qty: l.qty,
        price: l.price,
        category: l.category as Category,
        comment: l.comment ?? "",
      })),
    }));

    return NextResponse.json(orders);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
export async function PATCH(req: Request) {
  try {
    const supabase = supabaseAdmin();
    const body = await req.json();

    const { id, status } = body;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: "Missing id or status" }),
        { status: 400 }
      );
    }

    const allowed = ["NY", "PABORJAD", "KLAR", "UTLAMNAD", "ARKIV"];
    if (!allowed.includes(status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status: ${status}` }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Server error" }),
      { status: 500 }
    );
  }
}
