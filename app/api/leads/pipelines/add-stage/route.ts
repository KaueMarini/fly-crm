import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID as string;

export async function POST(request: Request) {
  try {
    const { name } = await request.json(); // Recebe nome da nova coluna

    // 1. Pega opções atuais
    const db = await notion.databases.retrieve({ database_id: databaseId });
    const currentOptions = (db.properties as any)['Status'].select.options;

    // 2. Adiciona a nova
    const updatedOptions = [...currentOptions, { name }];

    // 3. Atualiza o Schema do Banco
    await notion.databases.update({
        database_id: databaseId,
        properties: {
            'Status': {
                select: {
                    options: updatedOptions
                }
            }
        }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}