from typing import Dict, Optional
# from fastapi import FastAPI
# import cv2
import pymysql
import os
import json
from ast import ExtSlice, literal_eval
import shutil


def search(dirname):
    import os
    filenames = os.listdir(dirname)
    tmp = []
    for filename in filenames:
        tar = os.path.join(dirname, filename)
        if os.path.isdir(tar):
            tmp += search(os.path.join(tar))
        elif filename.split(".")[-1].lower() in ['csv']:
            tmp.append(tar)
    return tmp


files = search("/mnt/hdd1/temp/210714/SIDE")

for file in files:
    if not os.path.isfile(file.replace(".csv", '.png')):
        os.remove(file)
