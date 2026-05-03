import re
from datetime import datetime

def convert_timestamp(date_str):
    if not date_str:
        return "Unknown Time"

    iso_match = re.search(r"(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})\.(\d{3})", date_str)
    
    if iso_match:
        try:
            date_part = iso_match.group(1)
            time_part = iso_match.group(2)
            ms_part = iso_match.group(3)
            
            dt = datetime.strptime(f"{date_part} {time_part}", "%Y-%m-%d %H:%M:%S")
            return dt.strftime(f"%b %d, %Y - %I:%M:%S.{ms_part} %p")
        except Exception:
            pass

    win_match = re.search(r"/Date\((\d+)\)/", date_str)
    if win_match:
        millis = int(win_match.group(1))
        dt = datetime.fromtimestamp(millis / 1000.0)
        ms = millis % 1000
        return dt.strftime(f"%b %d, %Y - %I:%M:%S.{ms:03d} %p")

    return date_str
