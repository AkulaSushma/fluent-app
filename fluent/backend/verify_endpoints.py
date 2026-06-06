import httpx
import sys

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "demo@fluent.app"
PASSWORD = "demo123"

def run_tests():
    print("Fluent Backend API Verification Script")
    print("=" * 40)
    
    # 1. Login
    print("\n1. Testing Login...")
    client = httpx.Client(timeout=30.0)
    try:
        response = client.post(
            f"{BASE_URL}/auth/login",
            json={"email": EMAIL, "password": PASSWORD}
        )
    except httpx.ConnectError:
        print("ERROR: Backend server is not running on http://localhost:8000")
        sys.exit(1)
        
    if response.status_code != 200:
        print(f"FAILED: Login returned status {response.status_code}: {response.text}")
        sys.exit(1)
        
    token_data = response.json()
    token = token_data.get("access_token")
    print(f"SUCCESS: Logged in successfully. Token: {token[:15]}...")
    
    # Configure headers
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get profile
    print("\n2. Testing /auth/me...")
    response = client.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /auth/me returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: Profile details: {response.json().get('name')} ({response.json().get('email')})")
        
    # 3. Get vocab themes
    print("\n3. Testing /vocab/themes...")
    response = client.get(f"{BASE_URL}/vocab/themes", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /vocab/themes returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: Themes: {response.json()}")
        
    # 4. Get vocab deck (should trigger fallback/library)
    print("\n4. Testing /vocab/deck?theme=corporate...")
    response = client.get(f"{BASE_URL}/vocab/deck?theme=corporate", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /vocab/deck returned {response.status_code}: {response.text}")
    else:
        cards = response.json().get("cards", [])
        print(f"SUCCESS: Retrieved {len(cards)} vocabulary cards.")
        
    # 5. Get random article
    print("\n5. Testing /articles/random...")
    response = client.get(f"{BASE_URL}/articles/random", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /articles/random returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: Article title: {response.json().get('title')}")

    # 6. Get curriculum today
    print("\n6. Testing /curriculum/today...")
    response = client.get(f"{BASE_URL}/curriculum/today", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /curriculum/today returned {response.status_code}: {response.text}")
    else:
        data = response.json()
        print(f"SUCCESS: Morning tasks: {len(data.get('morning_tasks', []))}, Evening tasks: {len(data.get('evening_tasks', []))}")
        
    # 7. Get SRS due cards
    print("\n7. Testing /srs/due...")
    response = client.get(f"{BASE_URL}/srs/due?limit=10", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /srs/due returned {response.status_code}: {response.text}")
    else:
        data = response.json()
        print(f"SUCCESS: Overdue/Due cards count: {data.get('total_due')}. Returned batch size: {len(data.get('cards', []))}")
        
    # 8. Get SRS stats
    print("\n8. Testing /srs/stats...")
    response = client.get(f"{BASE_URL}/srs/stats", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /srs/stats returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: Stats: {response.json()}")
        
    # 9. Get gamification XP
    print("\n9. Testing /gamification/xp...")
    response = client.get(f"{BASE_URL}/gamification/xp", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /gamification/xp returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: XP State: {response.json()}")
        
    # 10. Get gamification achievements
    print("\n10. Testing /gamification/achievements...")
    response = client.get(f"{BASE_URL}/gamification/achievements", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /gamification/achievements returned {response.status_code}: {response.text}")
    else:
        achievements = response.json().get("achievements", [])
        unlocked = sum(1 for a in achievements if a.get("unlocked"))
        print(f"SUCCESS: achievements count: {len(achievements)}. Unlocked count: {unlocked}")
        
    # 11. Get progress statistics
    print("\n11. Testing /progress/me...")
    response = client.get(f"{BASE_URL}/progress/me", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /progress/me returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: User Progress Level: {response.json().get('xp_level')}")
        
    # 12. Get progress heatmap
    print("\n12. Testing /progress/heatmap...")
    response = client.get(f"{BASE_URL}/progress/heatmap", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /progress/heatmap returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: Heatmap data entries: {len(response.json())}")
        
    # 13. Get progress seriousness score
    print("\n13. Testing /progress/seriousness...")
    response = client.get(f"{BASE_URL}/progress/seriousness", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: /progress/seriousness returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: Seriousness details: {response.json()}")

    # 14. Test AI Tutor chat
    print("\n14. Testing /tutor/chat...")
    response = client.post(
        f"{BASE_URL}/tutor/chat",
        headers=headers,
        json={"history": [], "message": "Hi, I want to practice my English"}
    )
    if response.status_code != 200:
        print(f"FAILED: /tutor/chat returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: Tutor response: {response.json().get('reply')}")

    # 15. Test curriculum day/phase switching
    print("\n15. Testing /curriculum/set-day?day_number=31...")
    response = client.post(
        f"{BASE_URL}/curriculum/set-day?day_number=31",
        headers=headers
    )
    if response.status_code != 200:
        print(f"FAILED: /curriculum/set-day returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: Curriculum day set successfully: {response.json()}")
        # Reset back to day 24 for the demo user
        client.post(
            f"{BASE_URL}/curriculum/set-day?day_number=24",
            headers=headers
        )

    # 16. Test Visual Vocabulary cards
    print("\n16. Testing /vocab/visual...")
    response = client.get(
        f"{BASE_URL}/vocab/visual",
        headers=headers
    )
    if response.status_code != 200:
        print(f"FAILED: /vocab/visual returned {response.status_code}: {response.text}")
    else:
        cards = response.json().get("cards", [])
        print(f"SUCCESS: /vocab/visual returned {len(cards)} visual cards successfully.")

    # 17. Test Coach tech article
    print("\n17. Testing /coach/tech-article...")
    response = client.get(
        f"{BASE_URL}/coach/tech-article",
        headers=headers
    )
    if response.status_code != 200:
        print(f"FAILED: /coach/tech-article returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: /coach/tech-article returned: {response.json().get('title')}")

    # 18. Test Coach tongue twister
    print("\n18. Testing /coach/tongue-twister?level=beginner...")
    response = client.get(
        f"{BASE_URL}/coach/tongue-twister?level=beginner",
        headers=headers
    )
    if response.status_code != 200:
        print(f"FAILED: /coach/tongue-twister returned {response.status_code}: {response.text}")
    else:
        data = response.json()
        print(f"SUCCESS: /coach/tongue-twister returned {len(data.get('twisters', []))} twisters.")
        print(f"  - Warm-up Audio URL: {data.get('warm_up_audio')}")
        print(f"  - Twister 1 Audio URL: {data.get('twisters')[0].get('audio_url') if data.get('twisters') else 'None'}")
        print(f"  - Challenge Audio URL: {data.get('challenge_audio')}")

    # 19. Test Coach corporate phrases
    print("\n19. Testing /coach/corporate-phrases...")
    response = client.get(
        f"{BASE_URL}/coach/corporate-phrases",
        headers=headers
    )
    if response.status_code != 200:
        print(f"FAILED: /coach/corporate-phrases returned {response.status_code}: {response.text}")
    else:
        print(f"SUCCESS: /coach/corporate-phrases returned {len(response.json().get('phrases', []))} phrases.")

    print("\nVerification Complete.")

if __name__ == "__main__":
    run_tests()
