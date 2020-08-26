from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object('config')

CORS(app)

import api # to pass 'app' to api

if __name__ == '__main__':
	# socketio.run(app, port=app.config['PORT'], host='0.0.0.0', debug=True)
	app.run(host='0.0.0.0', port=app.config["PORT"], debug=app.config["DEBUG"])

