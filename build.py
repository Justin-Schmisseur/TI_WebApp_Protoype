#%%
import time
import os
import re
import glob
import zipfile
#%%

ignore = [".*build.*"]
ignore = [re.compile(i) for i in ignore]
def should_include(candidate):
  for ignore_case in ignore:
    if ignore_case.match(candidate):
      return False
  return True

#doesn't include git directory by default
files =glob.glob("**", recursive=True ) 

files = list(filter(lambda x: should_include(x), files ))

#%%
timestamp = time.strftime('%b-%d-%Y_%H%M', time.localtime())
project_name = f"TI-WISUN-WebApp-{timestamp}"

with zipfile.ZipFile(f'build/{project_name}.zip','w') as gc_app_zipped:
  for file in files:
    gc_app_zipped.write(file,os.path.join(project_name,file))

# %%
