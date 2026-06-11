import re
from typing import Dict
from .base import BaseNormalizer

# Structured Telugu digit words
TELUGU_ONES = ["శూన్యం", "ఒకటి", "రెండు", "మూడు", "నాలుగు", "ఐదు", "ఆరు", "ఏడు", "ఎనిమిది", "తొమ్మిది"]
TELUGU_TEENS = [
    "పది", "padakondu", "పన్నెండు", "పదమూడు", "పద్నాలుగు", "పదిహేను", "పదహారు", "పదిహేడు", "పద్దెనిమిది", "పంతొమ్మిది"
]
# Transcribe 11-19 phonetically fully into Telugu characters
TELUGU_TEENS = [
    "పది", "పదకొండు", "పన్నెండు", "పదమూడు", "పద్నాలుగు", "పదిహేను", "పదహారు", "పదిహేడు", "పద్దెనిమిది", "పంతొమ్మిది"
]
TELUGU_TENS = ["", "", "ఇరవై", "முప్పై", "నలభై", "యాభై", "అరవై", "డెబ్బై", "ఎనభై", "తొంభై"]
# Fixed typos in muppai for Telugu
TELUGU_TENS = ["", "", "ఇరవై", "ముప్పై", "నలభై", "యాభై", "అరవై", "డెబ్బై", "ఎనభై", "తొంభై"]

MONTHS_TE = ["", "జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"]

ABBREVIATIONS_TE = {
    r'\bడా\.\b': 'డాక్టర్',
    r'\bశ్రీ\.\b': 'శ్రీ',
    r'\bశ్రీమతి\.\b': 'శ్రీమతి',
    r'\bప్రొ\.\b': 'ప్రొఫెసర్',
    r'\bకి\.ಮೀ\.\b': 'కిలోమీటర్',
    r'\bకె\.జి\.\b': 'కిలోగ్రామ్',
}

TELUGU_DIGITS = {"౦": "0", "౧": "1", "౨": "2", "౩": "3", "౪": "4", "౫": "5", "౬": "6", "౭": "7", "౮": "8", "౯": "9"}

def clean_telugu_digits(text: str) -> str:
    """Standardizes Telugu numerals into Arabic digits."""
    for tel_char, ara_char in TELUGU_DIGITS.items():
        text = text.replace(tel_char, ara_char)
    return text

def num_99_to_words_te(n: int) -> str:
    """Translates integers 0-99 to Telugu words cleanly."""
    if n < 10:
        return TELUGU_ONES[n]
    elif n < 20:
        return TELUGU_TEENS[n - 10]
    else:
        t = n // 10
        o = n % 10
        if o == 0:
            return TELUGU_TENS[t]
        else:
            return TELUGU_TENS[t] + " " + TELUGU_ONES[o]

def int_to_words_te(num: int) -> str:
    """Recursively processes large numbers following Indian numbering standards in Telugu."""
    if num == 0:
        return "శూన్యం"
        
    words = []
    
    # Crore (10,000,000)
    crore = num // 10000000
    remainder = num % 10000000
    if crore > 0:
        words.append(int_to_words_te(crore) + " కోట్లు")
        
    # Lakh (100,000)
    lakh = remainder // 100000
    remainder = remainder % 100000
    if lakh > 0:
        words.append(int_to_words_te(lakh) + " లక్షలు")
        
    # Thousand (1000)
    thousand = remainder // 1000
    remainder = remainder % 1000
    if thousand > 0:
        if thousand == 1:
            words.append("వెయ్యి")
        else:
            words.append(num_99_to_words_te(thousand) + " వేలు")
        
    # Hundred (100)
    hundred = remainder // 100
    remainder = remainder % 100
    if hundred > 0:
        if hundred == 1:
            words.append("వంద")
        else:
            words.append(num_99_to_words_te(hundred) + " వందలు")
            
    if remainder > 0:
        words.append(num_99_to_words_te(remainder))
        
    return " ".join(words).strip()

def float_to_words_te(val_str: str) -> str:
    """Translates generic decimals into precise spoken Telugu strings."""
    val_str = clean_telugu_digits(val_str)
    val_str = val_str.replace(",", "").strip()
    if not val_str:
        return ""
        
    is_negative = val_str.startswith("-")
    if is_negative:
        val_str = val_str[1:]
        
    prefix = "మైనస్ " if is_negative else ""
    
    if "." in val_str:
        parts = val_str.split(".")
        if len(parts) == 2:
            left_side = int(parts[0]) if parts[0].isdigit() else 0
            right_side = parts[1]
            left_words = int_to_words_te(left_side)
            right_words = []
            for char in right_side:
                if char.isdigit():
                    num_char = int(char)
                    right_words.append(TELUGU_ONES[num_char] if num_char > 0 else "శూన్యం")
            return prefix + left_words + " బిందువు " + " ".join(right_words)
            
    if val_str.isdigit():
        return prefix + int_to_words_te(int(val_str))
        
    return val_str


class TeluguNormalizer(BaseNormalizer):
    """High-purity production-grade offline Telugu Text Normalizer."""

    def __init__(self):
        super().__init__()
        self.currency_re = re.compile(r'(\$|₹|£|€|Rs\.?)\s*(-?\d+(?:\.\d+)?)')
        self.general_num_re = re.compile(r'\b(-?\d+(?:\.\dots*(?:\.\d+)?|\.\d+|\d+))\b')
        self.general_num_re = re.compile(r'\b(-?\d+(?:\.\d+)?)\b')

    def normalize(self, text: str) -> str:
        text = clean_telugu_digits(text)
        return super().normalize(text)

    def expand_numeric_string(self, val_str: str) -> str:
        try:
            return float_to_words_te(val_str)
        except Exception:
            return val_str

    def normalize_urls(self, text: str) -> str:
        def repl(match):
            domain = match.group(1)
            path = match.group(2) or ""
            protocol = "ఎచ్ టి టి పి ఎస్" if "https" in match.group(0) else "ఎచ్ టి టి పి"
            domain_norm = domain.replace(".", " డాట్ ").replace("-", " డ్యాష్ ")
            path_norm = (path.replace("/", " స్లాష్ ")
                             .replace(".", " డాట్ ")
                             .replace("-", " డ్యాష్ ")
                             .replace("_", " అండర్ స్కోర్ ")
                             .replace("?", " క్వశ్చన్ మార్క్ ")
                             .replace("=", " ఈక్వల్స్ ")
                             .replace("&", " అండ్ "))
            return f"{protocol} కోలన్ స్లాష్ స్లాష్ {domain_norm} {path_norm}"
        return self.url_re.sub(repl, text)

    def normalize_emails(self, text: str) -> str:
        def repl(match):
            user = match.group(1)
            domain = match.group(2)
            user_norm = user.replace(".", " డాట్ ").replace("_", " అండర్ స్కోర్ ").replace("-", " డ్యాష్ ")
            domain_norm = domain.replace(".", " డాట్ ")
            return f"{user_norm} అట్ {domain_norm}"
        return self.email_re.sub(repl, text)

    def normalize_phones(self, text: str) -> str:
        def repl(match):
            raw_digits = match.group(0)
            chars = []
            for char in raw_digits:
                if char == '+':
                    chars.append("ప్లస్")
                elif char.isdigit():
                    num_d = int(char)
                    chars.append(TELUGU_ONES[num_d])
                elif char in ["-", "(", ")", " "]:
                    if chars and chars[-1] != ",":
                        chars.append(",")
            return " ".join(chars).replace(" ,", ",").strip()
        return self.phone_re.sub(repl, text)

    def normalize_percentages(self, text: str) -> str:
        def repl(match):
            val_str = match.group(1)
            val_word = self.expand_numeric_string(val_str)
            return f"{val_word} சதவீதம்"
        return self.percentage_re.sub(repl, text)

    def normalize_currencies(self, text: str) -> str:
        def repl(match):
            sym = match.group(1)
            val_str = match.group(2)
            try:
                val_word = self.expand_numeric_string(val_str)
                if sym in ['₹', 'Rs', 'Rs.']:
                    curr = "రూపాయలు"
                elif sym == '$':
                    curr = "డాలర్"
                elif sym == '£':
                    curr = "పౌండ్"
                elif sym == '€':
                    curr = "యూరో"
                else:
                    curr = "రూపాయలు"
                return f"{val_word} {curr}"
            except Exception:
                return match.group(0)
        return self.currency_re.sub(repl, text)

    def normalize_dates(self, text: str) -> str:
        # ISO: YYYY-MM-DD
        def repl_iso(match):
            try:
                year = int(match.group(1))
                month = int(match.group(2))
                day = int(match.group(3))
                if 1 <= month <= 12 and 1 <= day <= 31:
                    day_str = num_99_to_words_te(day)
                    month_str = MONTHS_TE[month]
                    year_str = float_to_words_te(str(year))
                    return f"{month_str} {day_str}, {year_str}"
            except Exception:
                pass
            return match.group(0)
            
        text = self.iso_date_re.sub(repl_iso, text)
        
        # DD/MM/YYYY or DD-MM-YYYY
        def repl_slash(match):
            try:
                g1 = int(match.group(1))
                g2 = int(match.group(2))
                year = int(match.group(3))
                if g1 > 12:
                    day, month = g1, g2
                elif g2 > 12:
                    day, month = g2, g1
                else:
                    day, month = g1, g2
                if 1 <= month <= 12 and 1 <= day <= 31:
                    day_str = num_99_to_words_te(day)
                    month_str = MONTHS_TE[month]
                    year_str = float_to_words_te(str(year))
                    return f"{month_str} {day_str}, {year_str}"
            except Exception:
                pass
            return match.group(0)
            
        text = self.slash_date_re.sub(repl_slash, text)
        return text

    def normalize_times(self, text: str) -> str:
        # Padded AM/PM Time
        def repl_padded(match):
            try:
                hr = int(match.group(1))
                mn = int(match.group(2))
                period_raw = match.group(3).lower()
                period = "ఉదయం" if "a" in period_raw else "రాత్రి"
                
                hr_word = num_99_to_words_te(hr)
                if mn == 0:
                    return f"{period} {hr_word} గంటలు"
                else:
                    mn_word = num_99_to_words_te(mn)
                    return f"{period} {hr_word} గంటల {mn_word} నిమిషాలు"
            except Exception:
                pass
            return match.group(0)
            
        text = self.time_padded_re.sub(repl_padded, text)
        
        # 24-hr Time
        def repl_24(match):
            try:
                hr = int(match.group(1))
                mn = int(match.group(2))
                if 0 <= hr <= 23 and 0 <= mn <= 59:
                    hr_word = num_99_to_words_te(hr)
                    if mn == 0:
                        return f"{hr_word} గంటలు"
                    else:
                        mn_word = num_99_to_words_te(mn)
                        return f"{hr_word} గంటల {mn_word} నిమిషాలు"
            except Exception:
                pass
            return match.group(0)
            
        text = self.time_24_re.sub(repl_24, text)
        return text

    def expand_abbreviations(self, text: str) -> str:
        for pattern_str, label in ABBREVIATIONS_TE.items():
            pattern = re.compile(pattern_str)
            text = pattern.sub(label, text)
        return text

    def expand_numbers(self, text: str) -> str:
        def repl(match):
            val_str = match.group(1)
            val_word = self.expand_numeric_string(val_str)
            return val_word
        return self.general_num_re.sub(repl, text)
