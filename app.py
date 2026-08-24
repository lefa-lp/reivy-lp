"""
REIVY Facial Wax LP - ローカルプレビュー用サーバー

起動方法:
    pip install flask
    python app.py

パソコンで確認する場合:
    http://127.0.0.1:5000

スマートフォンで確認する場合（同じWi-Fiに接続していること）:
    1. パソコンのローカルIPアドレスを確認（例: 192.168.1.10）
       - Mac: システム設定 > Wi-Fi > 詳細
       - Windows: コマンドプロンプトで `ipconfig` を実行し IPv4 アドレスを確認
    2. スマホのブラウザで http://（パソコンのIPアドレス）:5000 にアクセス
       例: http://192.168.1.10:5000

このLPはHTML/CSS/JavaScriptのみで動作するため、
将来的には一般的なレンタルサーバーにそのまま設置できます。
Flaskはあくまでローカル確認・フォーム処理用です。
"""

from flask import Flask, send_from_directory, request, jsonify

app = Flask(__name__, static_folder=".", static_url_path="")


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)


# 必要に応じたフォーム処理（例：問い合わせフォームを追加する場合はここに実装）
@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}
    # EDIT: 実際の問い合わせ処理（メール送信・保存など）はここに実装してください
    print("お問い合わせを受信しました:", data)
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    # host="0.0.0.0" にすることで、同じWi-Fi内のスマホなど他端末からもアクセス可能になります
    app.run(debug=True, host="0.0.0.0", port=5000)
