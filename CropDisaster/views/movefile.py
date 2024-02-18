from typing import Dict, Optional
from fastapi import FastAPI
import cv2
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
        elif filename.split(".")[-1].lower() in ['png', 'jpg', 'gif']:
            tmp.append(tar)
    return tmp


connection = pymysql.connect(
    user='choi',
    passwd='1518',
    host='phenome.iptime.org',
    db='CropDisaster',
    port=23306,
    charset='utf8'
)
cursor = connection.cursor(pymysql.cursors.DictCursor)


app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/move/")
async def move(species: Optional[str] = None, res_purpose: Optional[str] = None, res_type: Optional[int] = 0, res_admin: Optional[str] = None, res_stdate: Optional[str] = None, res_eddate: Optional[str] = '', res_name: Optional[str] = None, dtype: Optional[int] = 0, nodes: Optional[str] = ''):
    global cursor
    global connection
    target = json.loads(nodes)
    if res_eddate == '':
        sql = f"INSERT INTO Research (`species`, `res_purpose`, `res_type`,`res_admin`, `res_stdate`, `res_name`, `type`) VALUES ("

        for i in [species, res_purpose, res_type, res_admin, res_stdate, res_name, dtype]:
            if type(i) is type(None):
                sql += 'null,'
            elif type(i) is type(0):
                sql += f"{i},"
            else:
                sql += f"'{i}',"
        sql = sql[:-1]+")"
    else:
        sql = f"INSERT INTO Research (`species`, `res_purpose`, `res_type`,`res_admin`, `res_stdate`, `res_eddate`, `res_name`, `type`) VALUES ("
        for i in [species, res_purpose, res_type, res_admin, res_stdate, res_eddate, res_name, dtype]:
            if type(i) is type(None):
                sql += 'null,'
            elif type(i) is type(0):
                sql += f"{i},"
            else:
                sql += f"'{i}',"
        sql = sql[:-1]+")"
    try:
        cursor.execute(sql)
        connection.commit()
    except Exception:
        connection = pymysql.connect(
            user='choi',
            passwd='1518',
            host='phenome.iptime.org',
            db='CropDisaster',
            port=23306,
            charset='utf8'
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(sql)
        connection.commit()
        
    res_id = cursor.lastrowid
    targetfolder = f'/mnt/hdd2/CropDisaster/{res_id}'
    base_folder = '/mnt/hdd1/2022_NIA'
    try:
        os.mkdir(targetfolder)
    except FileExistsError as e:
        print(e)
    files = []
    for tar in target:
        tmptar = ''
        if tar[0] == '/':
            tmptar = tar[1:]
        else:
            tmptar = tar
        targetf = os.path.join(base_folder, tmptar)
        if os.path.isdir(targetf):
            shutil.copytree(targetf, targetf.replace(
                base_folder, targetfolder), dirs_exist_ok=True)
            # files += search(targetf)
        else:
            shutil.copy(targetf, targetf.replace(base_folder, targetfolder))
    phenosql = []
    labelArray = []
    # files.append(targetf)
    for file in search(targetfolder):
        ext = file.split(".")[-1]
        filename = file.split("/")[-1]
        labels = filename.split("_")
        label = labels[2] + "_" + labels[3] + "_" + labels[4]
        labelArray.append(label)
        angle = labels[5] + "_" + labels[6]
        img = cv2.imread(file)
        height, width = img.shape[:2]
        dst = cv2.resize(img, (200, int(200*(height/width))),
                         interpolation=cv2.INTER_NEAREST)
        cv2.imwrite(file.replace('.'+ext, f"_buf.{ext}"), dst)
        imagesql = f"INSERT INTO Image (`res_id`, `img_name`, `img_path` ,`label`, `angle`, `time`) VALUES ({res_id}, '{file.split('/')[-1]}', '{file}', '{label}', '{angle}', '{labels[-1].split('.')[0]}')"
        cursor.execute(imagesql)
        connection.commit()
        image_id = cursor.lastrowid
        if os.path.isfile(file.replace(ext, 'csv')):
            f = open(file.replace(ext, 'csv'))
            for row in f.readlines():
                data = row.strip('\n').split(";")
                if data[0] in labelArray :
                    # Area = data[8]
                    # BoundaryPointCount = data[13]
                    # BoundaryPointRoundness = data[14]
                    # BoundaryPointsToAreaRatio = data[15]
                    # CaliperLength = data[16]
                    # Circumference = data[17]
                    # CenterOfMassX = data[19]
                    # CenterOfMassY = data[20]
                    # Compactness = data[21]
                    # ConvexHullArea = data[23]
                    # ConvexHullCircumference = data[24]
                    # Excentricity = data[25]
                    # ObjectExtentX = data[26]
                    # ObjectExtentY = data[27]
                    # MeanColorBlue = data[33]
                    # MeanColorBlueVariance = data[34]
                    # BoundMeanColorGreenaryPointCnt = data[35]
                    # MeanColorGreenVariance = data[36]
                    # MeanColorRed = data[37]
                    # MeanColorRedVariance = data[38]
                    # MinEnclosingCircleDiameter = data[39]
                    # MinAreaRectangleArea = data[40]
                    # Roundness = data[45]
                    phenosql.append([image_id, labels[-1].split('.')[0], data[8], data[13], data[14], data[15], data[16], data[17], data[19], data[20], data[21], data[23], 
                    data[24], data[25], data[26], data[27], data[33], data[34], data[35], data[36], data[37], data[38], data[39], data[40], data[45]])  # 데이터 csv 형태

    sql3 = f"INSERT INTO Phenotype_Data (img_id, time, dt_format_0, dt_format_1, dt_format_2, dt_format_3, dt_format_4, dt_format_5, dt_format_6, dt_format_7,\
                dt_format_8, dt_format_9, dt_format_10, dt_format_11,dt_format_ 12, dt_format_13, dt_format_14, dt_format_15, dt_format_16, dt_format_17, dt_format_18,\
                dt_format_19, dt_format_20, dt_format_21, dt_format_22) VALUES (%d, %s, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d)"
    cursor.executemany(sql3, phenosql)
    connection.commit()
    return {"message": "Hello World"}
