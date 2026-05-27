import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteEmail } from '@/lib/email-gmail';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.emailAddress || !body.fullName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Send email with quote
        await sendQuoteEmail(body);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending quote:', error);
        return NextResponse.json(
            { error: 'Failed to send quote' },
            { status: 500 }
        );
    }
}