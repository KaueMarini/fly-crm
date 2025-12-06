import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID as string;

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    const response = await notion.databases.retrieve({ database_id: databaseId });
    const db = response as any;
    
    // Pega opções atuais de 'Funil'
    const funilProp = db.properties?.['Funil'];
    if (!funilProp) throw new Error("Coluna 'Funil' não existe no Notion.");

    const currentOptions = funilProp.select.options;
    const updatedOptions = [...currentOptions, { name }];

    await notion.databases.update({
        database_id: databaseId,
        properties: {
            'Funil': { select: { options: updatedOptions } }
        }
    } as any);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}