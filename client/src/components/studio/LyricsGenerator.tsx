import React from 'react';
import EnhancedLyricsGenerator from './EnhancedLyricsGenerator';

interface LyricsGeneratorProps {
  onSaveLyrics: (lyrics: string) => void;
  initialLyrics?: string;
}

// This component now serves as a wrapper for our new enhanced lyrics generator
export default function LyricsGenerator({
  onSaveLyrics,
  initialLyrics = ''
}: LyricsGeneratorProps) {
  return (
    <EnhancedLyricsGenerator 
      onSaveLyrics={onSaveLyrics}
      initialLyrics={initialLyrics}
    />
  );
}