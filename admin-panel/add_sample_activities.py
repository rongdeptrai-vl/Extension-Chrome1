# © 2024 TINI COMPANY - CONFIDENTIAL
# Employee: rongdeptrai-vl <rongdz2307@gmail.com>
# Commit: 58a24a1 | Time: 2025-08-09T15:18:25Z
# Watermark: TINI_1754752705_e868a412 | TINI_WATERMARK
# WARNING: Unauthorized distribution is prohibited
# © 2024 TINI COMPANY - CONFIDENTIAL
# Add sample activities for real analytics data

import sqlite3
import random
from datetime import datetime, timedelta

# Database path
db_path = 'tini_admin.db'

print('📊 Adding sample activities for analytics...')

# Create connection
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Generate realistic activities for the last 24 hours
now = datetime.now()
activities = []

# Generate hourly data for last 24 hours
for i in range(24):
    activity_time = now - timedelta(hours=i)
    
    # Traffic activities (user logins)
    for j in range(random.randint(1, 8)):  # 1-8 users per hour
        activities.append((
            random.randint(1, 5),  # user_id
            'Login',
            'User session started',
            '127.0.0.1',
            activity_time.strftime('%Y-%m-%d %H:%M:%S')
        ))
    
    # Performance activities
    response_time = random.randint(80, 250)
    activities.append((
        1,
        'Response Time',
        str(response_time),
        '127.0.0.1',
        activity_time.strftime('%Y-%m-%d %H:%M:%S')
    ))
    
    # Session duration activities
    session_duration = random.randint(120, 600)  # 2-10 minutes
    activities.append((
        random.randint(1, 5),
        'Session Duration',
        str(session_duration),
        '127.0.0.1',
        activity_time.strftime('%Y-%m-%d %H:%M:%S')
    ))
    
    # Bounce activities (some users leave quickly)
    if random.random() < 0.25:  # 25% bounce rate
        activities.append((
            random.randint(1, 5),
            'Bounce',
            'User left quickly',
            '127.0.0.1',
            activity_time.strftime('%Y-%m-%d %H:%M:%S')
        ))
    
    # Conversion activities (some users convert)
    if random.random() < 0.08:  # 8% conversion rate
        activities.append((
            random.randint(1, 5),
            'Conversion',
            'User completed action',
            '127.0.0.1',
            activity_time.strftime('%Y-%m-%d %H:%M:%S')
        ))
    
    # Security activities (occasional)
    if random.random() < 0.1:  # 10% chance per hour
        activities.append((
            random.randint(1, 5),
            'Security Alert',
            'Suspicious activity detected',
            '192.168.1.' + str(random.randint(1, 254)),
            activity_time.strftime('%Y-%m-%d %H:%M:%S')
        ))

# Insert all activities
cursor.executemany('''
    INSERT INTO activities (user_id, action, details, ip_address, created_at) 
    VALUES (?, ?, ?, ?, ?)
''', activities)

# Add some recent activities for real-time display
for i in range(10):
    recent_time = now - timedelta(minutes=i*5)
    cursor.execute('''
        INSERT INTO activities (user_id, action, details, ip_address, created_at) 
        VALUES (?, ?, ?, ?, ?)
    ''', (
        random.randint(1, 5),
        'Page View',
        'Analytics dashboard accessed',
        '127.0.0.1',
        recent_time.strftime('%Y-%m-%d %H:%M:%S')
    ))

# Commit and close
conn.commit()
conn.close()

print(f'✅ Added {len(activities) + 10} sample activities')
print('📈 Database now contains realistic analytics data')
print('🚀 Server will show real data from database')
