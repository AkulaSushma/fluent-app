import os
import logging
from typing import Optional

log = logging.getLogger(__name__)

# Future-flag: ENABLE_AZURE_PA=1 configures Azure Pronunciation Assessment
ENABLE_AZURE_PA = os.getenv("ENABLE_AZURE_PA", "0") == "1"
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "eastus")

async def evaluate_with_azure(
    audio_bytes: bytes,
    target_text: str,
) -> Optional[dict]:
    """
    Optional Azure Speech Pronunciation Assessment API caller.
    Returns None if disabled or credentials missing, falling back to local/AI alignment.
    """
    if not ENABLE_AZURE_PA or not AZURE_SPEECH_KEY:
        return None

    try:
        import httpx
        import base64
        import json

        # Azure expects pronunciation assessment parameters in a base64-encoded JSON header
        param_json = json.dumps({
            "ReferenceText": target_text,
            "GradingSystem": "HundredMark",
            "Granularity": "Phoneme",
            "Dimension": "Comprehensive"
        })
        param_b64 = base64.b64encode(param_json.encode("utf-8")).decode("utf-8")

        url = f"https://{AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US"
        
        headers = {
            "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
            "Pronunciation-Assessment": param_b64,
            "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
            "Accept": "application/json"
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, headers=headers, content=audio_bytes)
            resp.raise_for_status()
            result = resp.json()
            
            # Extract scores and convert to our format
            # Ref: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment
            if "NBest" in result and result["NBest"]:
                nbest = result["NBest"][0]
                pron_result = nbest.get("PronunciationAssessment", {})
                accuracy = int(pron_result.get("AccuracyScore", 0))
                fluency = int(pron_result.get("FluencyScore", 0))
                
                # Parse words
                words = []
                for idx, w in enumerate(nbest.get("Words", [])):
                    w_text = w.get("Word", "")
                    w_pron = w.get("PronunciationAssessment", {})
                    w_score = int(w_pron.get("AccuracyScore", 0))
                    
                    status = "good"
                    if w_score < 60:
                        status = "miss"
                    elif w_score < 80:
                        status = "warn"
                        
                    words.append({
                        "i": idx,
                        "text": w_text,
                        "score": w_score,
                        "status": status
                    })
                
                return {
                    "accuracy": accuracy,
                    "fluency_wpm": fluency,
                    "words": words,
                    "problem_phonemes": [],  # Can extract phoneme details if needed
                    "motivation": "Evaluated via Azure Speech Assessment."
                }
    except Exception as e:
        log.warning("Azure Pronunciation Assessment failed, falling back: %s", e)
        
    return None
