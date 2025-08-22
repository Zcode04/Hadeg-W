export const runtime = 'edge'; // يُعلن أن الـ Route Handler سيعمل على Edge Runtime
import { NextRequest, NextResponse } from 'next/server';
import { createGeminiApi, ChatRequest, ChatResponse } from '@/app/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, messages = [] } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json<ChatResponse>({
        message: 'الرسالة مطلوبة',
        success: false,
        error: 'رسالة فارغة',
      }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not defined');
      return NextResponse.json<ChatResponse>({
        message: 'خطأ في الإعدادات',
        success: false,
        error: 'مفتاح API غير موجود',
      }, { status: 500 });
    }

    const geminiApi = createGeminiApi();

    const conversationHistory = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: `أنت مساعد ذكي ومفيد. تجيب باللغة العربية بشكل واضح ومفيد.\n\n${message}` }]
      }
    ];

    const response = await geminiApi.post('models/gemini-1.5-flash:generateContent', {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    const aiMessage = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiMessage) {
      return NextResponse.json<ChatResponse>({
        message: 'لم أتمكن من الحصول على رد',
        success: false,
        error: 'رد فارغ من Gemini',
      }, { status: 500 });
    }

    return NextResponse.json<ChatResponse>({
      message: aiMessage,
      success: true,
    });

  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number; data?: { error?: { message?: string } } } };
    console.error('خطأ في API الدردشة:', error);

    if (err.response?.status === 401 || err.response?.status === 403) {
      return NextResponse.json<ChatResponse>({
        message: 'خطأ في المصادقة - تحقق من مفتاح API',
        success: false,
        error: `مفتاح API غير صحيح: ${err.response?.data?.error?.message || 'غير معروف'}`,
      }, { status: 401 });
    }

    if (err.response?.status === 429) {
      return NextResponse.json<ChatResponse>({
        message: 'تم تجاوز الحد المسموح، حاول لاحقًا',
        success: false,
        error: 'تجاوز الحد المسموح',
      }, { status: 429 });
    }

    if (err.response?.status === 400) {
      return NextResponse.json<ChatResponse>({
        message: 'طلب غير صحيح',
        success: false,
        error: `خطأ في البيانات: ${err.response?.data?.error?.message || 'غير معروف'}`,
      }, { status: 400 });
    }

    return NextResponse.json<ChatResponse>({
      message: 'حدث خطأ في الخادم، حاول مرة أخرى',
      success: false,
      error: err.message || 'خطأ غير معروف',
    }, { status: 500 });
  }
}
