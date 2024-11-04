# ระบบจองตั๋วหนังออนไลน์

ระบบจองตั๋วหนังนี้เป็นระบบที่ครอบคลุมทั้งฝั่งลูกค้าและพนักงาน **โดยบาง feature นั้น
จะไม่สามารถใช้การได้หากรันบน localhost เช่น ระบบที่เกี่ยวข้องกับการสแกน QR Code ที่ไม่สามารถสแกนข้าม device ได้บน localhost**

ระบบนี้มีทั้งหมด 4 Actors ที่ไม่รวมแอดมิน ได้แก่ ลูกค้า พนักงานตรวจตั๋ว พนักงานฝ่ายบริการลูกค้า และ พนักงานหน้าเคาน์เตอร์


## ขั้นตอนการติดตั้งและเปิดใช้งาน
```bash
npm init -y 
npm install -g nodemon
npm install express express-session sqlite3 ejs qrcode
```
```
nodemon index.js
```
หากเกิด error ที่เกี่ยวกับ sqlite3 ลองวิธีนี้
```bash
npm uninstall sqlite3
npm install sqlite3
```

## รหัสการเข้าใช้งาน
ลูกค้า: 
```
url: /login หรือ http://localhost:3000/login
username: test
password: 1234
```
พนักงาน:
```
url: /employee/login หรือ http://localhost:3000/employee/login

พนักงานตรวจตั๋ว
username: test_checker 
password: 1234

พนักงานหน้าเคาน์เตอร์
username: test_counter
password: 1234

พนักงานฝ่ายบริการลูกค้า
username: test_service
password: 1234

Admin
username: test_admin
password: 1234
```
	
