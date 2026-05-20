import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// 🛡️ Ensure you add OPENAI_API_KEY to your .env.local to activate the AI brain
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

/**
 * POST /api/meetings/process
 * Handles Meeting Audio Recording -> Transcription -> AI Summary
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob
    const roomId = formData.get('roomId') as string

    if (!audioFile || !roomId) {
      return NextResponse.json({ error: 'Missing audio or room context' }, { status: 400 })
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        transcript: "AI Transcription disabled. Please provide an OPENAI_API_KEY in .env.local to activate the Sanctuary Intelligence Engine.",
        summary: "Transcription and Summarization require an active AI brain. Connect your OpenAI API key to begin synthesizing meeting intelligence."
      })
    }

    // 1. 🧬 UPLOAD TO SUPABASE STORAGE (Archive)
    const supabase = createClient()
    const fileName = `meeting_${roomId}_${Date.now()}.webm`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meeting-archives')
      .upload(fileName, audioFile)

    if (uploadError) {
      console.error('[IntelAPI] Storage Upload Failed:', uploadError)
    }

    // 2. 🎙️ TRANSCRIBE WITH WHISPER
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile, 'audio.webm')
    whisperFormData.append('model', 'whisper-1')

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: whisperFormData,
    })

    const transcriptionData = await transcriptionResponse.json()
    const transcript = transcriptionData.text || "No transcription available."

    // 3. 🧠 SUMMARIZE WITH GPT-4
    const summarizationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are the RoomX Intelligence Engine. Summarize the following meeting transcript into high-value executive highlights and actionable items. Keep it concise, premium, and professional.' 
          },
          { 
            role: 'user', 
            content: `Transcript: ${transcript}` 
          }
        ],
        temperature: 0.7,
      }),
    })

    const summarizationData = await summarizationResponse.json()
    const summary = summarizationData.choices[0]?.message?.content || "No summary generated."

    // 4. 💾 SAVE TO DATABASE
    await supabase.from('meeting_summaries').insert({
      room_id: roomId,
      transcript: transcript,
      summary: summary,
      audio_url: uploadData?.path || null,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({ transcript, summary })

  } catch (error) {
    console.error('[IntelAPI] Critical failure:', error)
    return NextResponse.json({ error: 'Failed to process sanctuary intelligence' }, { status: 500 })
  }
}
