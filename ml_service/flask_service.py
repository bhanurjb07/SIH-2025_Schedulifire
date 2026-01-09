from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Simple round-robin timetablem generator
@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    rooms = data.get('rooms', [])
    subjects = data.get('subjects', [])
    faculties = data.get('faculties', [])
    batches = data.get('batches', [])

    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    slots_per_day = 6

    sub_to_fac = {}
    for s in subjects:
        for f in faculties:
            if f.get('specialty') == s.get('code'):
                sub_to_fac[s['code']] = f['name']
                break
        if s.get('code') not in sub_to_fac:
            sub_to_fac[s['code']] = faculties[0]['name'] if faculties else 'TBD'

    def make_schedule(seed=0):
        schedule = {b['name']: [] for b in batches}
        idx = seed
        for s in subjects:
            hrs = s.get('hoursPerWeek', 3)
            for h in range(hrs):
                day = days[idx % len(days)]
                slot = (idx // len(days)) % slots_per_day
                room = rooms[idx % max(1, len(rooms))]['name'] if rooms else 'Room-1'
                faculty = sub_to_fac[s['code']]
                batch = batches[idx % len(batches)]
                schedule[batch['name']].append({
                    'day': day,
                    'slot': slot,
                    'room': room,
                    'subject': s['code'],
                    'faculty': faculty
                })
                idx += 1
        return schedule

    candidates = [make_schedule(seed=i) for i in range(3)]

    return jsonify({'timetables': candidates})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
