import { createAudioPlayer } from 'expo-audio';

// Static audio player instance to reuse for TTS pronunciations
let ttsPlayer: any = null;

/**
 * Pronounces text in a highly reliable, sweet, and clear voice by streaming
 * Google Translate's neural TTS API through expo-audio.
 * This ensures voice output works on all devices without relying on native TTS engine packages.
 */
export const speakSweetly = (text: string) => {
  if (!text) return;

  // Clean text of emojis and special characters for clear speech
  const cleanText = text
    .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')
    .trim();

  if (!cleanText) return;

  try {
    const encodedText = encodeURIComponent(cleanText.substring(0, 200));
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodedText}`;

    if (!ttsPlayer) {
      // Create a programmatic audio player instance
      ttsPlayer = createAudioPlayer(url);
    } else {
      // Replace source dynamically for the next pronunciation
      ttsPlayer.replace(url);
    }
    
    // Play the audio stream immediately
    ttsPlayer.play();
  } catch (err) {
    console.error('[speakSweetly] Failed to play TTS audio stream:', err);
  }
};
