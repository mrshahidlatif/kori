This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## How to run Kori?

The system includes a frontend and a backend. To start the application, run `npm install` followed by `npm start`. The app will run on localhost:3000.

The backend is implemented in Python using the Flask server. To start the Flask server, run `python server.py`. Please refer to readme.md inside the server directory for installing the Flask server and setting up a virtual environment. We use the [Google's pretrained Word2Vec model](https://mccormickml.com/2016/04/12/googles-pretrained-word2vec-model-in-python/). Download it [here](https://drive.google.com/file/d/0B7XkCwpI5KDYNlNUTTlSS21pQmM/edit) and copy the binary file in the `/public/lang_models` directory. The Flask server will run at port 8885. 
