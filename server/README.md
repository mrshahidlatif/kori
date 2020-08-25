
### Requirement 
- Python3 
- Pip3

### Install
#### Create a virtual environment
```bash
python3 -m venv .env
```

#### Activiate the environment
```bash
source .env/bin/activate
```

#### Install dependencies

```bash
pip3 install -r requirements.txt
```


#### Run the server
```bash
python3 server.py
```
Or you could use `pip` and `python` directly if they point to python version 3 (e.g., putting `alias python=python3` and `alias pip=pip3` in `~/.bashrc`).

#### Install new packages
```bash
pip3 install -U neuralcoref
```

#### Save new dependencies
```bash
pip3 freeze >requirements.txt
```

