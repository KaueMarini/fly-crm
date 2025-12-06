// app/api/leads/update/route.ts
import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_KEY });

export async function POST(request: Request) {
  try {
    const { pageId, status, observation } = await request.json();

    await notion.pages.update({
      page_id: pageId,
      properties: {
        "Status": { select: { name: status } }, // Ex: "Qualificado"
        // Se tiver campo de observação, descomente abaixo:
        // ...(observation && { "Observações": { rich_text: [{ text: { content: observation } }] } })
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}