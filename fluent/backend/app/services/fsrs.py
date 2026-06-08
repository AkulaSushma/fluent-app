import math
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

# Simple but robust FSRS implementation constants
# S_0(grade) is initial stability
INITIAL_STABILITY = {
    0: 0.4,   # Again (approx 10 hours)
    1: 0.9,   # Hard (approx 21 hours)
    2: 2.5,   # Good (2.5 days)
    3: 6.0    # Easy (6.0 days)
}

# D_0(grade) is initial difficulty
INITIAL_DIFFICULTY = {
    0: 8.0,   # Again
    1: 6.5,   # Hard
    2: 5.0,   # Good
    3: 3.5    # Easy
}

def calculate_next_review(
    stability: float,
    difficulty: float,
    grade: int,
    last_reviewed: Optional[datetime],
    current_time: Optional[datetime] = None
) -> Tuple[float, float, datetime]:
    """
    Apply FSRS scheduling algorithm updates.
    Returns:
        Tuple of (new_stability, new_difficulty, due_at)
    """
    if current_time is None:
        current_time = datetime.now(timezone.utc)
        
    # Standardize current_time timezone to UTC if it isn't set
    if current_time.tzinfo is None:
        current_time = current_time.replace(tzinfo=timezone.utc)

    # First review (never reviewed before)
    if last_reviewed is None:
        new_stability = INITIAL_STABILITY.get(grade, 2.5)
        new_difficulty = INITIAL_DIFFICULTY.get(grade, 5.0)
    else:
        # Standardize last_reviewed to UTC
        if last_reviewed.tzinfo is None:
            last_reviewed = last_reviewed.replace(tzinfo=timezone.utc)
            
        elapsed_days = (current_time - last_reviewed).total_seconds() / 86400.0
        elapsed_days = max(0.01, elapsed_days) # Prevent zero or negative division
        
        # Predicted recall probability: R(t) = 2^(-t / stability)
        recall_probability = math.pow(2.0, -elapsed_days / max(0.1, stability))
        
        if grade == 0:
            # Again (Lapse): reset stability and increase difficulty
            new_stability = INITIAL_STABILITY[0]
            new_difficulty = min(10.0, difficulty + 1.5)
        else:
            # Successful review: stability increases
            if grade == 1:   # Hard
                factor = 1.2
                new_difficulty = min(10.0, difficulty + 1.0)
            elif grade == 2: # Good
                # Desirable difficulty factor (e.g. bonus if reviewed near due date)
                factor = 2.5 * math.exp(0.1 * (1.0 - recall_probability))
                new_difficulty = max(1.0, min(10.0, difficulty - 0.2))
            else:            # Easy (grade == 3)
                factor = 5.0 * math.exp(0.2 * (1.0 - recall_probability))
                new_difficulty = max(1.0, difficulty - 1.0)
                
            new_stability = stability * factor
            
    # Cap stability at 1 year (365 days)
    new_stability = min(365.0, max(0.1, new_stability))
    
    # Calculate due_at time
    due_at = current_time + timedelta(days=new_stability)
    
    return new_stability, new_difficulty, due_at
