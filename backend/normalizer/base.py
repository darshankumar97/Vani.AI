import re
from typing import Dict, Pattern, List

class BaseNormalizer:
    """
    Subclassable pipeline for offline multilingual text normalization.
    Specifically designed to clean up and expand raw text into natural, TTS-friendly words.
    """

    def __init__(self):
        # Common pre-compiled regex patterns for general NLP processing
        self.repeated_punct_re: Pattern = re.compile(r'([!?,.:;])\1+')
        self.email_re: Pattern = re.compile(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})')
        self.url_re: Pattern = re.compile(r'https?://(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(/[^\s]*)?')
        
        # Phone: Matches +91-98765-43210, +1 (555) 019-2834, 1-800-555-0199, etc.
        self.phone_re: Pattern = re.compile(r'\+?\b\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{2,5}[-.\s]?\d{2,5}\b')
        
        # Percentages: e.g. 15.5% or 42%
        self.percentage_re: Pattern = re.compile(r'\b(\d+(?:\.\d+)?)\s*%')
        
        # ISO Dates (2026-06-09) and Slash/Dash Dates (09/06/2026 or 09-06-2026)
        self.iso_date_re: Pattern = re.compile(r'\b(\d{4})-(\d{2})-(\d{2})\b')
        self.slash_date_re: Pattern = re.compile(r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b')
        
        # Time patterns: e.g. 10:30 AM, 11:15pm, 23:45
        self.time_padded_re: Pattern = re.compile(r'\b(\d{1,2}):(\d{2})\s*(?:(AM|PM|am|pm))\b')
        self.time_24_re: Pattern = re.compile(r'\b(\d{1,2}):(\d{2})\b')

        # Clean noise characters (brackets, math operators that are not speech-friendly)
        self.noise_chars_re: Pattern = re.compile(r'[*_~^\[\]\(\)\{\}<>|#-]')

    def clean_repeated_punctuation(self, text: str) -> str:
        """Compresses blocks like '!!!' or '???' to a single mark to prevent model jitter."""
        # Replace multiple successive marks with the first one
        text = self.repeated_punct_re.sub(r'\1', text)
        return text

    def clean_noise_characters(self, text: str) -> str:
        """Removes markdown wrappers or telemetry notations."""
        text = self.noise_chars_re.sub(' ', text)
        # Clean multiple spaces
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def normalize_urls(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def normalize_emails(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def normalize_phones(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def normalize_percentages(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def normalize_dates(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def normalize_times(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def normalize_currencies(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def expand_abbreviations(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def expand_numbers(self, text: str) -> str:
        """To be implemented or customized by language normalizers."""
        return text

    def normalize(self, text: str) -> str:
        """
        Executes the overall sequential normalization pipeline.
        Precedence:
          1. Clean repeated punctuation
          2. Normalize emails
          3. Normalize URLs
          4. Normalize phones
          5. Normalize currencies
          6. Normalize percentages
          7. Normalize dates
          8. Normalize times
          9. Expand abbreviations
          10. Expand general numbers
          11. Clean remaining noise characters
        """
        if not text:
            return ""
        
        text = self.clean_repeated_punctuation(text)
        text = self.normalize_emails(text)
        text = self.normalize_urls(text)
        text = self.normalize_phones(text)
        text = self.normalize_currencies(text)
        text = self.normalize_percentages(text)
        text = self.normalize_dates(text)
        text = self.normalize_times(text)
        text = self.expand_abbreviations(text)
        text = self.expand_numbers(text)
        text = self.clean_noise_characters(text)
        
        return text
