interface TranscriptWord {
  word: string;
  start: number; // seconds
  end: number; // seconds
  probability?: number; // optional confidence score
}

interface TranscriptSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens?: number[];
  temperature?: number;
  avg_logprob?: number;
  compression_ratio?: number;
  no_speech_prob?: number;
  words?: TranscriptWord[];
}

interface TranscriptMetadata {
  source_file?: string;
  model?: string;
  filename?: string;
  [key: string]: unknown;
}

interface Transcript {
  text: string;
  segments?: TranscriptSegment[];
  language?: string;
  metadata?: TranscriptMetadata;
}

interface Clip {
  id: number;
  audioUrl: string;
  createdAt: string;
  speakerId: number;
  transcription?: Transcript | null;
}

export type { Clip, Transcript, TranscriptSegment, TranscriptWord, TranscriptMetadata };