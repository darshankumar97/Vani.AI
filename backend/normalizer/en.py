import re
from typing import Dict
from .base import BaseNormalizer

# English constant dictionaries for number translation
ONES_EN = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", 
           "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
TENS_EN = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
THOUSANDS_EN = ["", "thousand", "million", "billion", "trillion"]

MONTHS_EN = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
DAYS_EN = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
           "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth",
           "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth", "twenty-sixth", "twenty-seventh", "twenty-eighth", "twenty-ninth", "thirtieth", "thirty-first"]

ABBREVIATIONS_EN = {
    r'\bDr\.\b': 'Doctor',
    r'\bMr\.\b': 'Mister',
    r'\bMrs\.\b': 'Missus',
    r'\bMs\.\b': 'Miss',
    r'\bJr\.\b': 'Junior',
    r'\bSr\.\b': 'Senior',
    r'\bSt\.\b': 'Street',
    r'\bAve\.\b': 'Avenue',
    r'\bCo\.\b': 'Company',
    r'\bCorp\.\b': 'Corporation',
    r'\bInc\.\b': 'Incorporated',
    r'\bLtd\.\b': 'Limited',
    r'\be\.g\.\b': 'for example',
    r'\bi\.e\.\b': 'that is',
    r'\bvs\.\b': 'versus',
    r'\bJan\.\b': 'January',
    r'\bFeb\.\b': 'February',
    r'\bMar\.\b': 'March',
    r'\bApr\.\b': 'April',
    r'\bJun\.\b': 'June',
    r'\bJul\.\b': 'July',
    r'\bAug\.\b': 'August',
    r'\bSep\.\b': 'September',
    r'\bOct\.\b': 'October',
    r'\bNov\.\b': 'November',
    r'\bDec\.\b': 'December',
}

def int_to_words_en(num: int) -> str:
    """Converts a positive integer to English words."""
    if num == 0:
        return "zero"
    
    words = []
    
    def helper(n: int) -> str:
        res = []
        h = n // 100
        t = n % 100
        if h > 0:
            res.append(ONES_EN[h])
            res.append("hundred")
        if t > 0:
            if t < 20:
                res.append(ONES_EN[t])
            else:
                tens_digit = t // 10
                ones_digit = t % 10
                res.append(TENS_EN[tens_digit])
                if ones_digit > 0:
                    res.append(ONES_EN[ones_digit])
        return " ".join(res)

    i = 0
    temp = num
    while temp > 0:
        chunk = temp % 1000
        if chunk > 0:
            chunk_str = helper(chunk)
            if THOUSANDS_EN[i]:
                words.append(chunk_str + " " + THOUSANDS_EN[i])
            else:
                words.append(chunk_str)
        temp //= 1000
        i += 1
        
    return " ".join(reversed(words)).strip()

def float_to_words_en(val_str: str) -> str:
    """Safely converts numeric notation to words, handling signs, and floats."""
    val_str = val_str.replace(",", "").strip()
    if not val_str:
        return ""
    
    is_negative = val_str.startswith("-")
    if is_negative:
        val_str = val_str[1:]
        
    prefix = "minus " if is_negative else ""
    
    if "." in val_str:
        parts = val_str.split(".")
        if len(parts) == 2:
            left_side = int(parts[0]) if parts[0].isdigit() else 0
            right_side = parts[1]
            
            left_words = int_to_words_en(left_side)
            right_words = []
            for char in right_side:
                if char.isdigit():
                    num_char = int(char)
                    right_words.append(ONES_EN[num_char] if num_char > 0 else "zero")
            
            return prefix + left_words + " point " + " ".join(right_words)
            
    if val_str.isdigit():
        return prefix + int_to_words_en(int(val_str))
        
    return val_str

def year_to_words_en(year: int) -> str:
    """Translates numeric calendar year format logically."""
    if 2000 <= year < 2010:
        return "two thousand " + ONES_EN[year % 100] if year % 100 != 0 else "two thousand"
    elif 1000 <= year < 2000 or 2010 <= year < 3000:
        first_half = year // 100
        sec_half = year % 100
        first_word = int_to_words_en(first_half)
        if sec_half == 0:
            return f"{first_word} hundred"
        elif sec_half < 10:
            return f"{first_word} oh {ONES_EN[sec_half]}"
        else:
            return f"{first_word} {int_to_words_en(sec_half)}"
    else:
        return int_to_words_en(year)


class EnglishNormalizer(BaseNormalizer):
    """Production-grade offline English Text Normalizer using precompiled regular expressions."""

    def __init__(self):
        super().__init__()
        # Matches $, ₹, £, € or "Rs." prepended to logical digits
        self.currency_re = re.compile(r'(\$|₹|£|€|Rs\.?)\s*(-?\d+(?:\.\d+)?)')
        self.general_num_re = re.compile(r'\b(-?\d+(?:\.\dots*(?:\.\d+)?|\.\d+|\d+))\b')

    def expand_numeric_string(self, val_str: str) -> str:
        """Helper to safely map standard floats/ints to text."""
        try:
            return float_to_words_en(val_str)
        except Exception:
            return val_str

    def normalize_urls(self, text: str) -> str:
        def repl(match):
            domain = match.group(1)
            path = match.group(2) or ""
            protocol = "h t t p s" if "https" in match.group(0) else "h t t p"
            domain_norm = domain.replace(".", " dot ").replace("-", " dash ")
            path_norm = (path.replace("/", " slash ")
                             .replace(".", " dot ")
                             .replace("-", " dash ")
                             .replace("_", " underscore ")
                             .replace("?", " question mark ")
                             .replace("=", " equals ")
                             .replace("&", " and "))
            return f"{protocol} colon slash slash {domain_norm} {path_norm}"
        return self.url_re.sub(repl, text)

    def normalize_emails(self, text: str) -> str:
        def repl(match):
            user = match.group(1)
            domain = match.group(2)
            user_norm = user.replace(".", " dot ").replace("_", " underscore ").replace("-", " dash ")
            domain_norm = domain.replace(".", " dot ")
            return f"{user_norm} at {domain_norm}"
        return self.email_re.sub(repl, text)

    def normalize_phones(self, text: str) -> str:
        def repl(match):
            raw_digits = match.group(0)
            chars = []
            for char in raw_digits:
                if char == '+':
                    chars.append("plus")
                elif char.isdigit():
                    num_d = int(char)
                    chars.append(ONES_EN[num_d] if num_d > 0 else "zero")
                elif char in ["-", "(", ")", " "]:
                    if chars and chars[-1] != ",":
                        chars.append(",")
            return " ".join(chars).replace(" ,", ",").strip()
        return self.phone_re.sub(repl, text)

    def normalize_percentages(self, text: str) -> str:
        def repl(match):
            val_str = match.group(1)
            val_word = self.expand_numeric_string(val_str)
            return f"{val_word} percent"
        return self.percentage_re.sub(repl, text)

    def normalize_currencies(self, text: str) -> str:
        def repl(match):
            sym = match.group(1)
            val_str = match.group(2)
            try:
                val_float = abs(float(val_str.replace(",", "")))
                val_word = self.expand_numeric_string(val_str)
                is_one = val_float == 1.0
                
                if sym == '$':
                    curr = "dollar" if is_one else "dollars"
                elif sym in ['₹', 'Rs', 'Rs.']:
                    curr = "rupee" if is_one else "rupees"
                elif sym == '£':
                    curr = "pound" if is_one else "pounds"
                elif sym == '€':
                    curr = "euro" if is_one else "euros"
                else:
                    curr = "rupees"
                return f"{val_word} {curr}"
            except Exception:
                return match.group(0)
        return self.currency_re.sub(repl, text)

    def normalize_dates(self, text: str) -> str:
        # ISO format: YYYY-MM-DD
        def repl_iso(match):
            try:
                year = int(match.group(1))
                month = int(match.group(2))
                day = int(match.group(3))
                if 1 <= month <= 12 and 1 <= day <= 31:
                    month_str = MONTHS_EN[month]
                    day_str = DAYS_EN[day]
                    year_str = year_to_words_en(year)
                    return f"{month_str} {day_str}, {year_str}"
            except Exception:
                pass
            return match.group(0)
        
        text = self.iso_date_re.sub(repl_iso, text)
        
        # Indian/Global format: DD/MM/YYYY or DD-MM-YYYY
        def repl_slash(match):
            try:
                g1 = int(match.group(1))
                g2 = int(match.group(2))
                year = int(match.group(3))
                
                # Determine Day/Month order logic
                if g1 > 12:
                    day, month = g1, g2
                elif g2 > 12:
                    day, month = g2, g1
                else:
                    day, month = g1, g2  # default Indian DD/MM/YYYY
                    
                if 1 <= month <= 12 and 1 <= day <= 31:
                    month_str = MONTHS_EN[month]
                    day_str = DAYS_EN[day]
                    year_str = year_to_words_en(year)
                    return f"{day_str} of {month_str}, {year_str}"
            except Exception:
                pass
            return match.group(0)
            
        text = self.slash_date_re.sub(repl_slash, text)
        return text

    def normalize_times(self, text: str) -> str:
        def repl_padded(match):
            try:
                hr = int(match.group(1))
                mn = int(match.group(2))
                period = match.group(3).upper()
                hr_str = int_to_words_en(hr)
                if mn == 0:
                    mn_str = "o'clock"
                elif mn < 10:
                    mn_str = f"oh {ONES_EN[mn]}"
                else:
                    mn_str = int_to_words_en(mn)
                return f"{hr_str} {mn_str} {period}"
            except Exception:
                pass
            return match.group(0)
            
        text = self.time_padded_re.sub(repl_padded, text)
        
        def repl_24(match):
            try:
                hr = int(match.group(1))
                mn = int(match.group(2))
                if 0 <= hr <= 23 and 0 <= mn <= 59:
                    hr_str = int_to_words_en(hr)
                    if mn == 0:
                        mn_str = "hundred hours"
                    elif mn < 10:
                        mn_str = f"oh {ONES_EN[mn]}"
                    else:
                        mn_str = int_to_words_en(mn)
                    return f"{hr_str} {mn_str}"
            except Exception:
                pass
            return match.group(0)
            
        text = self.time_24_re.sub(repl_24, text)
        return text

    def expand_abbreviations(self, text: str) -> str:
        for pattern_str, label in ABBREVIATIONS_EN.items():
            pattern = re.compile(pattern_str)
            text = pattern.sub(label, text)
        return text

    def expand_numbers(self, text: str) -> str:
        def repl(match):
            val_str = match.group(1)
            val_word = self.expand_numeric_string(val_str)
            return val_word
        return self.general_num_re.sub(repl, text)
