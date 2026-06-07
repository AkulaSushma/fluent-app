import math

def sm2(quality: int, repetitions: int, ease_factor: float, interval_days: int) -> tuple[int, int, float]:
    """
    SuperMemo-2 Spaced Repetition Algorithm.
    quality: 1 (forgot), 3 (hard), 4 (good), 5 (easy)
    Returns: (new_interval_days, new_repetitions, new_ease_factor)
    """
    if quality >= 3:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = math.ceil(interval_days * ease_factor)
        repetitions += 1
        ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    else:
        repetitions = 0
        interval = 1
        # On failure, ease factor is unchanged
    
    if ease_factor < 1.3:
        ease_factor = 1.3
        
    return interval, repetitions, ease_factor
