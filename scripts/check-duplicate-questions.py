"""
Check for duplicate sample questions across all speaking practice topics.
This script identifies questions that appear in multiple topics.
"""

import mysql.connector
import json
from collections import defaultdict

# Database connection
def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password=input("Enter MySQL password: "),
        database="quiz_generator"
    )

def check_duplicate_questions():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    # Get all topics with their sample questions
    cursor.execute("""
        SELECT id, title, difficulty_level, sample_questions 
        FROM speaking_practice_topics 
        ORDER BY id
    """)
    
    topics = cursor.fetchall()
    
    # Dictionary to track which topics use each question
    question_map = defaultdict(list)
    
    # Extract all questions from all topics
    print("\n" + "="*80)
    print("CHECKING FOR DUPLICATE SAMPLE QUESTIONS")
    print("="*80 + "\n")
    
    for topic in topics:
        topic_id = topic['id']
        topic_title = topic['title']
        questions_json = topic['sample_questions']
        
        # Parse JSON array
        try:
            questions = json.loads(questions_json)
        except:
            print(f"⚠️  Error parsing questions for topic: {topic_title}")
            continue
        
        # Normalize and store each question
        for q in questions:
            # Normalize: lowercase, strip whitespace
            normalized = q.lower().strip()
            question_map[normalized].append({
                'topic_id': topic_id,
                'topic_title': topic_title,
                'original_question': q
            })
    
    # Find duplicates
    duplicates_found = False
    duplicate_count = 0
    
    print("🔍 DUPLICATE QUESTIONS FOUND:\n")
    
    for question, usages in question_map.items():
        if len(usages) > 1:
            duplicates_found = True
            duplicate_count += 1
            
            print(f"❌ Question #{duplicate_count}: \"{usages[0]['original_question']}\"")
            print(f"   Used in {len(usages)} topics:")
            for usage in usages:
                print(f"   - [{usage['topic_id']}] {usage['topic_title']}")
            print()
    
    if not duplicates_found:
        print("✅ No duplicate questions found! All questions are unique across topics.\n")
    else:
        print(f"\n{'='*80}")
        print(f"SUMMARY: Found {duplicate_count} questions that appear in multiple topics")
        print(f"{'='*80}\n")
    
    # Statistics
    print("\n📊 STATISTICS:")
    print(f"   Total topics: {len(topics)}")
    total_questions = sum(len(json.loads(t['sample_questions'])) for t in topics)
    unique_questions = len(question_map)
    print(f"   Total questions: {total_questions}")
    print(f"   Unique questions: {unique_questions}")
    print(f"   Duplicate questions: {duplicate_count}")
    print(f"   Duplication rate: {(duplicate_count / unique_questions * 100):.1f}%\n")
    
    cursor.close()
    conn.close()
    
    return duplicates_found

if __name__ == "__main__":
    try:
        has_duplicates = check_duplicate_questions()
        exit(0 if not has_duplicates else 1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        exit(1)
