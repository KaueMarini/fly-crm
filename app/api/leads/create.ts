// app/api/leads/create/route.ts
import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_KEY });

export async function POST(request: Request) {
  try {
    const { nome, status, funil, telefone } = await request.json();

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID! },
      properties: {
        "Nome": { title: [{ text: { content: nome } }] },
        "Status": { select: { name: status } }, // Ex: "Novo Lead"
        "Funil": { select: { name: funil } },   // Ex: "Vendas"
        "Telefone": { rich_text: [{ text: { content: telefone || "" } }] }
      },
    });

    return NextResponse.json({ success: true, id: response.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}