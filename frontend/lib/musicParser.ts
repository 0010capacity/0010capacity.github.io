export interface Note {
  pitch: string; // e.g., "C4", "G5", or "-" for rest
  duration: string; // Tone.js duration format: "4n", "8n", "2n", etc.
}

export interface Track {
  name: string;
  instrument: OscillatorType;
  volume: number;
  notes: Note[];
}

export interface MusicScore {
  bpm: number;
  tracks: Track[];
}

type OscillatorType = "square" | "triangle" | "sawtooth" | "sine";

const VALID_INSTRUMENTS: OscillatorType[] = [
  "square",
  "triangle",
  "sawtooth",
  "sine",
];

function parseDuration(duration: string): string {
  // Convert numeric duration to Tone.js format
  // 1 = whole note, 2 = half note, 4 = quarter note, 8 = eighth note, 16 = sixteenth note
  const durationMap: Record<string, string> = {
    "1": "1n",
    "2": "2n",
    "4": "4n",
    "8": "8n",
    "16": "16n",
    "32": "32n",
  };
  return durationMap[duration] || "4n";
}

function parseNote(noteStr: string): Note | null {
  const trimmed = noteStr.trim();
  if (!trimmed) return null;

  const parts = trimmed.split("/");
  if (parts.length !== 2) return null;

  const pitch = parts[0];
  const duration = parts[1];
  if (!pitch || !duration) return null;

  return {
    pitch: pitch.trim(),
    duration: parseDuration(duration.trim()),
  };
}

function parseNotes(line: string): Note[] {
  const notes: Note[] = [];
  const noteStrings = line.trim().split(/\s+/);

  for (const noteStr of noteStrings) {
    const note = parseNote(noteStr);
    if (note) {
      notes.push(note);
    }
  }

  return notes;
}

export function parseMusicScore(content: string): MusicScore {
  const lines = content.split("\n");
  const score: MusicScore = {
    bpm: 120,
    tracks: [],
  };

  let currentTrack: Track | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    // Parse BPM
    if (trimmedLine.startsWith("BPM=")) {
      const bpmValue = parseInt(trimmedLine.substring(4), 10);
      if (!isNaN(bpmValue) && bpmValue > 0) {
        score.bpm = bpmValue;
      }
      continue;
    }

    // Parse track header
    const trackMatch = trimmedLine.match(/^\[TRACK(\d+)\]$/);
    if (trackMatch) {
      if (currentTrack) {
        score.tracks.push(currentTrack);
      }
      currentTrack = {
        name: `Track ${trackMatch[1]}`,
        instrument: "square",
        volume: 0.5,
        notes: [],
      };
      continue;
    }

    // Parse track properties
    if (currentTrack) {
      if (trimmedLine.startsWith("NAME=")) {
        currentTrack.name = trimmedLine.substring(5);
        continue;
      }

      if (trimmedLine.startsWith("INST=")) {
        const inst = trimmedLine.substring(5).toLowerCase() as OscillatorType;
        if (VALID_INSTRUMENTS.includes(inst)) {
          currentTrack.instrument = inst;
        }
        continue;
      }

      if (trimmedLine.startsWith("VOL=")) {
        const vol = parseFloat(trimmedLine.substring(4));
        if (!isNaN(vol) && vol >= 0 && vol <= 1) {
          currentTrack.volume = vol;
        }
        continue;
      }

      // Parse notes line (any line with "/" is considered notes)
      if (trimmedLine.includes("/")) {
        const notes = parseNotes(trimmedLine);
        currentTrack.notes.push(...notes);
      }
    }
  }

  // Don't forget the last track
  if (currentTrack) {
    score.tracks.push(currentTrack);
  }

  return score;
}

export function calculateTotalDuration(notes: Note[], bpm: number): number {
  // Calculate total duration in seconds
  const quarterNoteDuration = 60 / bpm;

  let totalDuration = 0;
  for (const note of notes) {
    const durationMap: Record<string, number> = {
      "1n": 4,
      "2n": 2,
      "4n": 1,
      "8n": 0.5,
      "16n": 0.25,
      "32n": 0.125,
    };
    const beats = durationMap[note.duration] || 1;
    totalDuration += beats * quarterNoteDuration;
  }

  return totalDuration;
}
