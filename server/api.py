from __main__ import app
# import json # use json.dumps(...) to serialize python objects
from flask import request, jsonify
import spacy

nlp = spacy.load("en_core_web_sm")



@app.route('/pos', methods=['GET'])
def pos():
    
    sentence = request.args['sentence']

    # print('Print logs', flush=True) # another way to print logs
    app.logger.info(sentence) # or use request.get_json for json data in fetch

    doc = nlp(sentence)
    
    return jsonify(status=True, message="success", data=doc.to_json()) 
    #return jsonify(status=False, message="wrong parameters!", data=response)