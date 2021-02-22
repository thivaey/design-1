# Commented out IPython magic to ensure Python compatibility.
# %%capture
# !pip install praw

import numpy as np
import praw
import pprint
import pickle
from datetime import datetime, timedelta
import requests
import time

def unix_to_utc(timestamp, offset):
  date = datetime.utcfromtimestamp(timestamp) + timedelta(hours=offset)
  return (date.year, date.month, date.day, date.hour, date.minute, date.second)

def flatten(mc):
  flat = mc.comments()
  if type(flat) == praw.models.comment_forest.CommentForest:
    return flat.list()
  return flat

def extract_comments(submission):
  comments = []
  unflattened = submission.comments.list()
  flattened = [c for c in unflattened if type(c) == praw.models.Comment]
  unflattened = [c for c in unflattened if type(c) != praw.models.Comment]
  while len(unflattened) > 0:
    unflattened = sum([flatten(mc) for mc in unflattened], [])
    flattened.extend([c for c in unflattened if type(c) == praw.models.Comment])
    unflattened = [c for c in unflattened if type(c) != praw.models.Comment]

  for c in flattened:
    comments.append(c.body)
  return comments

def scrape_submission(submission):
  scraped_data = {
      'time': submission.created_utc,
      'time_utc': unix_to_utc(submission.created_utc, offset=-6), 
      'title': submission.title,
      'text': submission.selftext,
      'comments': [] if submission.num_comments == 0 else extract_comments(submission),
      'votes': (submission.ups, submission.upvote_ratio)
  }
  return scraped_data

client_id, client_secret = '',''
with open('client_auth.txt', 'r') as f:
    client_id = f.readline().replace('\n', '')
    client_secret = f.readline.replace('\n', '')
reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    user_agent='comment scraper'
)

START_UT = 1577858400
END_UT = 1609480800
subreddit_name = 'UIUC'

def make_request(start_ut):
    url_base = 'https://api.pushshift.io/reddit/search/submission'
    params = {
        'subreddit': subreddit_name,
        'after': str(start_ut)
    }
    r = requests.get(url_base, params)
    data = r.json()
    return data

start_time = START_UT
scraped_data = []
error_ids = []
try: 
    while start_time < END_UT:
      success = 0
      while not success:
        try:
          data = make_request(start_time)['data']
          success = 1
        except:
          time.sleep(1)
      scraped = []
      for i in range(len(data)):
        id_ = data[i]['id']
        s = reddit.submission(id=id_)
        try:
          d = scrape_submission(s)
          if d['time'] < END_UT:
            scraped.append(d)
        except:
          error_ids.append(id_)

      scraped_data.extend(scraped)
      start_time = int(scraped[-1]['time'])
finally:
"""Debugging and Data dumping"""
    import sys
    import datetime
    print(sys.getsizeof(scraped_data))
    print(len(scraped_data))
    print(start_time)
    now = datetime.datetime.now().strftime('%m-%d_%H%M')

    pickle.dump(scraped_data, open(f'{subreddit_name}_raw_text_{now}.pkl', 'wb'))
    with open('error_ids.txt', 'ab') as handle:
      handle.write(now + '\n')
      for err_id in error_ids:
        handle.write(err_id + '\n')