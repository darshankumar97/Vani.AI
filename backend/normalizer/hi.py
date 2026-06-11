import re
from typing import Dict
from .base import BaseNormalizer

# Exhaustive and phonetically perfect Hindi maps for 0-99
HINDI_0_99 = [
    "शून्य", "एक", "दो", "तीन", "चार", "पांच", "छह", "सात", "आठ", "नौ", "दस",
    "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
    "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस", "तीस",
    "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस",
    "इकतालीस", "बयालीस", "तैंतालीस", "चौंतालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास",
    "इक्कावन", "बावन", "तिरेपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ", "साठ",
    "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सरसठ", "अड़सठ", "उनहत्तर", "सत्तर",
    "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उनासी", "अस्सी",
    "इक्यासी", "ब्यासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सतासी", "अठासी", "नवासी", "नब्बे",
    "इक्यानवे", "बानवे", "तिरानवे", "चौरानवे", "पंचानवे", "छियानवे", "सत्तानवे", "अट्ठानवे", "निन्यानवे"
]

MONTHS_HI = ["", "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"]

ABBREVIATIONS_HI = {
    r'\bडॉ\.\b': 'डॉक्टर',
    r'\bडॉक्टर\b': 'डॉक्टर',
    r'\bश्री\.\b': 'श्रीमान',
    r'\bश्रीमती\.\b': 'श्रीमती',
    r'\bप्रो\.\b': 'प्रोफेसर',
    r'\bकि\.मी\.\b': 'किलोमीटर',
    r'\bकि\.ग्रा\.\b': 'किलोग्राम',
    r'\bइत्य\.\b': 'इत्यादि',
    r'\bउदा\.\b': 'उदाहरण',
}

DEVANAGARI_DIGITS = {"०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"}

def clean_devanagari_digits(text: str) -> str:
    """Standardizes Devanagari numerals into Arabic digits."""
    for dev_char, ara_char in DEVANAGARI_DIGITS.items():
        text = text.replace(dev_char, ara_char)
    return text

def int_to_words_hi(num: int) -> str:
    """Applies the Indian number system to convert a positive integer to Hindi words recursively."""
    if num == 0:
        return "शून्य"
    
    words = []
    
    # Crore (10,000,000)
    crore = num // 10000000
    remainder = num % 10000000
    if crore > 0:
        words.append(int_to_words_hi(crore) + " करोड़")
        
    # Lakh (100,000)
    lakh = remainder // 100000
    remainder = remainder % 100000
    if lakh > 0:
        words.append(int_to_words_hi(lakh) + " लाख")
        
    # Thousand (1000)
    thousand = remainder // 1000
    remainder = remainder % 1000
    if thousand > 0:
        words.append(int_to_words_hi(thousand) + " हज़ार")
        
    # Hundred (100)
    hundred = remainder // 100
    remainder = remainder % 100
    if hundred > 0:
        words.append(HINDI_0_99[hundred] + " सौ")
        
    if remainder > 0:
        words.append(HINDI_0_99[remainder])
        
    return " ".join(words).strip()

def float_to_words_hi(val_str: str) -> str:
    """Converts positive and negative decimals to precise spoken Hindi words."""
    val_str = clean_devanagari_digits(val_str)
    val_str = val_str.replace(",", "").strip()
    if not val_str:
        return ""
        
    is_negative = val_str.startswith("-")
    if is_negative:
        val_str = val_str[1:]
        
    prefix = "माइनस " if is_negative else ""
    
    if "." in val_str:
        parts = val_str.split(".")
        if len(parts) == 2:
            left_side = int(parts[0]) if parts[0].isdigit() else 0
            right_side = parts[1]
            left_words = int_to_words_hi(left_side)
            right_words = []
            for char in right_side:
                if char.isdigit():
                    right_words.append(HINDI_0_99[int(char)])
            return prefix + left_words + " दशमलव " + " ".join(right_words)
            
    if val_str.isdigit():
        return prefix + int_to_words_hi(int(val_str))
        
    return val_str


class HindiNormalizer(BaseNormalizer):
    """High-purity production-grade offline Hindi Text Normalizer."""

    def __init__(self):
        super().__init__()
        self.currency_re = re.compile(r'(\$|₹|£|€|Rs\.?)\s*(-?\d+(?:\.\d+)?)')
        self.general_num_re = re.compile(r'\b(-?\d+(?:\.\d+)?)\b')

    def normalize(self, text: str) -> str:
        # Pre-process Devanagari numerals into standard digits first
        text = clean_devanagari_digits(text)
        return super().normalize(text)

    def expand_numeric_string(self, val_str: str) -> str:
        try:
            return float_to_words_hi(val_str)
        except Exception:
            return val_str

    def normalize_urls(self, text: str) -> str:
        def repl(match):
            domain = match.group(1)
            path = match.group(2) or ""
            protocol = "एच टी टी पी एस" if "https" in match.group(0) else "एच टी टी पी"
            domain_norm = domain.replace(".", " डॉट ").replace("-", " डैश ")
            path_norm = (path.replace("/", " स्लैश ")
                             .replace(".", " डॉट ")
                             .replace("-", " डैश ")
                             .replace("_", " अंडरस्कोर ")
                             .replace("?", " क्वेश्चन मार्क ")
                             .replace("=", " इक्वल्स ")
                             .replace("&", " एंड "))
            return f"{protocol} कोलन स्लैश स्लैश {domain_norm} {path_norm}"
        return self.url_re.sub(repl, text)

    def normalize_emails(self, text: str) -> str:
        def repl(match):
            user = match.group(1)
            domain = match.group(2)
            user_norm = user.replace(".", " डॉट ").replace("_", " अंडरस्कोर ").replace("-", " डैश ")
            domain_norm = domain.replace(".", " डॉट ")
            return f"{user_norm} ऐट {domain_norm}"
        return self.email_re.sub(repl, text)

    def normalize_phones(self, text: str) -> str:
        def repl(match):
            raw_digits = match.group(0)
            chars = []
            for char in raw_digits:
                if char == '+':
                    chars.append("प्लस")
                elif char.isdigit():
                    num_d = int(char)
                    chars.append(HINDI_0_99[num_d])
                elif char in ["-", "(", ")", " "]:
                    if chars and chars[-1] != ",":
                        chars.append(",")
            return " ".join(chars).replace(" ,", ",").strip()
        return self.phone_re.sub(repl, text)

    def normalize_percentages(self, text: str) -> str:
        def repl(match):
            val_str = match.group(1)
            val_word = self.expand_numeric_string(val_str)
            return f"{val_word} प्रतिशत"
        return self.percentage_re.sub(repl, text)

    def normalize_currencies(self, text: str) -> str:
        def repl(match):
            sym = match.group(1)
            val_str = match.group(2)
            try:
                val_word = self.expand_numeric_string(val_str)
                if sym in ['₹', 'Rs', 'Rs.']:
                    curr = "रुपये"
                elif sym == '$':
                    curr = "डॉलर"
                elif sym == '£':
                    curr = "पौंड"
                elif sym == '€':
                    curr = "यूरो"
                else:
                    curr = "रुपये"
                return f"{val_word} {curr}"
            except Exception:
                return match.group(0)
        return self.currency_re.sub(repl, text)

    def normalize_dates(self, text: str) -> str:
        # ISO Date: YYYY-MM-DD
        def repl_iso(match):
            try:
                year = int(match.group(1))
                month = int(match.group(2))
                day = int(match.group(3))
                if 1 <= month <= 12 and 1 <= day <= 31:
                    day_str = HINDI_0_99[day]
                    month_str = MONTHS_HI[month]
                    year_str = float_to_words_hi(str(year))
                    return f"{day_str} {month_str}, {year_str}"
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
                    day_str = HINDI_0_99[day]
                    month_str = MONTHS_HI[month]
                    year_str = float_to_words_hi(str(year))
                    return f"{day_str} {month_str}, {year_str}"
            except Exception:
                pass
            return match.group(0)
            
        text = self.slash_date_re.sub(repl_slash, text)
        return text

    def normalize_times(self, text: str) -> str:
        # Padded Time: hr:mn am/pm
        def repl_padded(match):
            try:
                hr = int(match.group(1))
                mn = int(match.group(2))
                period_raw = match.group(3).lower()
                period = "सुबह" if "a" in period_raw else "शाम"
                
                hr_word = HINDI_0_99[hr]
                if mn == 0:
                    return f"{period} {hr_word} बजे"
                else:
                    mn_word = HINDI_0_99[mn]
                    return f"{period} {hr_word} बजकर {mn_word} मिनट"
            except Exception:
                pass
            return match.group(0)
            
        text = self.time_padded_re.sub(repl_padded, text)
        
        # 24-hr Time: hr:mn
        def repl_24(match):
            try:
                hr = int(match.group(1))
                mn = int(match.group(2))
                if 0 <= hr <= 23 and 0 <= mn <= 59:
                    hr_word = HINDI_0_99[hr]
                    if mn == 0:
                        return f"{hr_word} बजे"
                    else:
                        mn_word = HINDI_0_99[mn]
                        return f"{hr_word} बजकर {mn_word} मिनट"
            except Exception:
                pass
            return match.group(0)
            
        text = self.time_24_re.sub(repl_24, text)
        return text

    def expand_abbreviations(self, text: str) -> str:
        for pattern_str, label in ABBREVIATIONS_HI.items():
            pattern = re.compile(pattern_str)
            text = pattern.sub(label, text)
        return text

    def expand_numbers(self, text: str) -> str:
        def repl(match):
            val_str = match.group(1)
            val_word = self.expand_numeric_string(val_str)
            return val_word
        return self.general_num_re.sub(repl, text)
