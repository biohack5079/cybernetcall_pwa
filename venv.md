# 仮想環境の作成（例：venvという名前の仮想環境を作成）
python3 -m venv venv

# 仮想環境の有効化（Linux/macOS）
source venv/bin/activate

# 仮想環境の有効化（Windows）
venv\Scripts\activate


python3 server.py
python3 -m http.server 8765
ngrok http 8765

python3 -m http.server 8000
http://localhost:8000/index.html 
http://localhost:8000/ にアクセスします。



source venv/bin/activate
python3 server.py
python3 -m http.server 8000
ngrok start --all



cybernetcall_pwa/
├── manage.py
├── cybernetcall_pwa/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── app/
│   ├── __init__.py
│   ├── views.py
│   ├── urls.py
│   ├── static/
│   │   ├── app.js
│   │   ├── sw.js
│   │   └── qrious.min.js
│   └── templates/
│       └── index.html
└── requirements.txt

