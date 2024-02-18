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
    db='Phenotype',
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
            db='Phenotype',
            port=23306,
            charset='utf8'
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        cursor.execute(sql)
        connection.commit()
    # if res_eddate == '':
    #     select = f"select res_id from Research  where "
    #     for i in [['species', species], ['res_purpose', res_purpose], ['res_type', res_type], ['res_admin', res_admin], ['res_stdate', res_stdate], ['res_name', res_name], ['type', dtype]]:
    #         if type(i[1]) is type(None):
    #             continue
    #         elif type(i[1]) is type(0):
    #             select += f"{i[0]}={i[1]} and "
    #         else:
    #             select += f"{i[0]}='{i[1]}' and "
    #     select = select[:-4] + "order by res_id desc"
    # else:
    #     select = f"select res_id from Research  where "
    #     for i in [['species', species], ['res_purpose', res_purpose], ['res_type', res_type], ['res_admin', res_admin], ['res_stdate', res_stdate], ['res_eddate', res_eddate], ['res_name', res_name], ['type', dtype]]:
    #         if type(i[1]) is type(None):
    #             continue
    #         elif type(i[1]) is type(0):
    #             select += f"{i[0]}={i[1]} and "
    #         else:
    #             select += f"{i[0]}='{i[1]}' and "
    #     select = select[:-4]
    # cursor.execute(select)
    res_id = cursor.lastrowid
    targetfolder = f'/mnt/hdd2/web/{res_id}'
    base_folder = '/mnt/hdd1/temp'
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
    # files.append(targetf)
    for file in search(targetfolder):
        ext = file.split(".")[-1]
        filename = file.split("/")[-1]
        labels = filename.split("_")
        label = labels[2] + "_" + labels[3] + "_" + labels[4]
        angle = labels[5] + "_" + labels[6]
        img = cv2.imread(file)
        height, width = img.shape[:2]
        dst = cv2.resize(img, (200, int(200*(height/width))),
                         interpolation=cv2.INTER_NEAREST)
        cv2.imwrite(file.replace('.'+ext, f"_buf.{ext}"), dst)
        imagesql = f"INSERT INTO Image (`Research_ID`, `Image_Name`, `Image_Path` ,`Label_Name`, `Angle`, `Time`) VALUES ({res_id}, '{file.split('/')[-1]}', '{file}', '{label}', '{angle}', '{labels[-1].split('.')[0]}')"
        cursor.execute(imagesql)
        connection.commit()
        image_id = cursor.lastrowid
        if os.path.isfile(file.replace(ext, 'csv')):
            f = open(file.replace(ext, 'csv'))
            for row in f.readlines():
                data = row.strip('\n').split(",")
                area = data[4]
                convex = data[7]
                centerX = data[5]
                centerY = data[6]

                phenosql.append([image_id, area, convex, centerX,
                                centerY, labels[-1].split('.')[0]])
    sql3 = f"INSERT INTO Phenotype_Data (Image_ID, area, convex_area, center_x, center_y,time) VALUES (%d, %d, %d, %d, %d, %s)"
    cursor.executemany(sql3, phenosql)
    connection.commit()
    return {"message": "Hello World"}
