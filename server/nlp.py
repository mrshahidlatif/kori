import spacy
import json



def getSubtree(root, direction='left'):
  subtree = []
  subject = list(root.lefts)[0] if direction == 'left'  else list(root.rights)[0]
  for descendant in subject.subtree:
    assert subject is descendant or subject.is_ancestor(descendant)
    subtree.append(descendant.text)
  return subtree

def groupLinks(sentence, ind_links):
  nlp = spacy.load("en_core_web_sm")
  doc = nlp(sentence)
  root = [token for token in doc if token.head == token][0]
  right_subtree = " ".join(getSubtree(root, direction='right'))
  left_subtree = " ".join(getSubtree(root, direction='left'))
  joinable_left = []
  joinable_right = []
  for link in ind_links:
    try:
      if (right_subtree.find(link) != -1):
        joinable_right.append(link)
      if (left_subtree.find(link) != -1):
        joinable_left.append(link)
    except:
      pass
  if (len(joinable_left)>=2):
    return joinable_left
  if (len(joinable_right)>=2):
    return joinable_right
  return []