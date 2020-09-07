

## Mini-Conda

### Requirement 
- Conda

### Install
#### Create a virtual environment
```bash
conda create --name kori python=3.7.3
```

#### Activiate the environment
```bash
conda activate kori
```

#### Deactivate the environment
```bash
conda deactivate
```

#### Create the environment from environment.yml
```bash
conda env create -f environment.yml
```

#### Export the environment
```bash
conda env export > environment.yml
```

#### Update an environment
```bash
conda env update --prefix ./env --file environment.yml  --prune
```
#### Install new packages
```bash
conda install neuralcoref
```

## Pip

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

## Spacy

### Install Spacy model
```bash
python -m spacy download en_core_web_sm
```




