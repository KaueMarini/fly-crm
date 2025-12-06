// app/api/leads/archive/route.ts
import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_KEY });

export async function POST(request: Request) {
  try {
    const { pageId } = await request.json();
    
    // Opção A: Mudar status para "Arquivado" (Recomendado para poder recuperar depois)
    await notion.pages.update({
      page_id: pageId,
      properties: {
        "Status": { select: { name: "Arquivado" } }
      }
    });

    // Opção B: Deletar mesmo
    // await notion.pages.update({ page_id: pageId, archived: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}