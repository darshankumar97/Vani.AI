from typing import Dict
from .base import BaseNormalizer
from .en import EnglishNormalizer
from .hi import HindiNormalizer
from .kn import KannadaNormalizer
from .te import TeluguNormalizer
from ..logger import logger

# Active normalizers cache
_NORMALIZERS: Dict[str, BaseNormalizer] = {
    "en": EnglishNormalizer(),
    "hi": HindiNormalizer(),
    "kn": KannadaNormalizer(),
    "te": TeluguNormalizer(),
}

def normalize_text(text: str, language_code: str) -> str:
    """
    Main entry point for SpeechCraft text normalization before synthesis.
    Processes mixed punctuation, phone numbers, times, percentages, abbreviations,
    and numbers offline to improve multi-lingual pronunciation accuracy.
    """
    if not text:
        return ""
    
    clean_code = language_code.strip().lower()
    
    # Select appropriate normalizer with 'en' as fallback
    normalizer = _NORMALIZERS.get(clean_code)
    if not normalizer:
        logger.warning(f"Unmanaged language '{language_code}' for normalization. Defaulting to English.")
        normalizer = _NORMALIZERS["en"]
        
    try:
        normalized_text = normalizer.normalize(text)
        logger.info(f"Text normalization [{clean_code}]: '{text}' -> '{normalized_text}'")
        return normalized_text
    except Exception as e:
        logger.error(f"Error executing text normalization: {str(e)}")
        # Graceful fallback: return original text to avoid disrupting core synthesis pipeline
        return text
