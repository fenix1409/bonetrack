import fs from 'fs/promises';
import path from 'path';

let _context: string | null = null;

export async function getBoneTrackSystemContext(): Promise<string> {
  if (_context) return _context;

  _context = await fs.readFile(
    path.join(__dirname, '../prompts/BoneTrack.md'),
    'utf-8'
  );

  return _context;
}