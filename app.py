from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# Load JSON data
with open('data/election_data.json', 'r') as file:
    election_data = json.load(file)

@app.route('/')
def index():
    return render_template('index.html', data=election_data)

@app.route('/api/data')
def get_data():
    return jsonify(election_data)

if __name__ == '__main__':
    app.run(debug=True)