from pathlib import Path

root = Path("/var/www/onlinecourse_frontend")
targets = list(root.rglob("*.html")) + list(root.rglob("*.js"))

replacements = [
    ("B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n gi\u1ea3ng vi\u00ean", "B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n n\u1ed9i dung"),
    ("Chia s\u1ebb m\u1edbi t\u1eeb gi\u1ea3ng vi\u00ean", "Chia s\u1ebb m\u1edbi t\u1eeb GHTXDBK"),
    ("Blog gi\u1ea3ng vi\u00ean", "Blog chuy\u00ean m\u00f4n"),
    ("\u0111\u1ed9i ng\u0169 gi\u1ea3ng vi\u00ean GHTXDBK", "\u0111\u1ed9i ng\u0169 GHTXDBK"),
    ("\u0111\u01b0\u1ee3c gi\u1ea3ng vi\u00ean GHTXDBK chia s\u1ebb tr\u1ef1c ti\u1ebfp tr\u00ean n\u1ec1n t\u1ea3ng", "\u0111\u01b0\u1ee3c GHTXDBK chia s\u1ebb tr\u1ef1c ti\u1ebfp tr\u00ean n\u1ec1n t\u1ea3ng"),
    ("\u0111\u01b0\u1ee3c gi\u1ea3ng vi\u00ean chia s\u1ebb tr\u1ef1c ti\u1ebfp tr\u00ean n\u1ec1n t\u1ea3ng", "\u0111\u01b0\u1ee3c GHTXDBK chia s\u1ebb tr\u1ef1c ti\u1ebfp tr\u00ean n\u1ec1n t\u1ea3ng"),
    ("N\u1ebfu gi\u1ea3ng vi\u00ean \u0111\u00e3 g\u1eafn t\u00e0i li\u1ec7u v\u00e0o kh\u00f3a h\u1ecdc, b\u1ea1n s\u1ebd th\u1ea5y ngay trong ph\u1ea7n t\u00e0i li\u1ec7u li\u00ean quan c\u1ee7a trang n\u00e0y.", "N\u1ebfu kh\u00f3a h\u1ecdc \u0111\u00e3 \u0111\u01b0\u1ee3c g\u1eafn t\u00e0i li\u1ec7u b\u1ed5 tr\u1ee3, b\u1ea1n s\u1ebd th\u1ea5y ngay trong ph\u1ea7n t\u00e0i li\u1ec7u li\u00ean quan c\u1ee7a trang n\u00e0y."),
    ("T\u00e0i li\u1ec7u s\u1ebd \u0111\u01b0\u1ee3c gi\u1ea3ng vi\u00ean c\u1eadp nh\u1eadt t\u1ea1i \u0111\u00e2y.", "T\u00e0i li\u1ec7u s\u1ebd \u0111\u01b0\u1ee3c c\u1eadp nh\u1eadt t\u1ea1i \u0111\u00e2y."),
    ("\u0110\u00e2y l\u00e0 c\u00e1c t\u00ean gi\u1ea3ng vi\u00ean \u0111\u00e3 xu\u1ea5t hi\u1ec7n tr\u00ean n\u1ed9i dung hi\u1ec7n c\u00f3 c\u1ee7a n\u1ec1n t\u1ea3ng. H\u1ed3 s\u01a1 chi ti\u1ebft c\u00f3 th\u1ec3 ti\u1ebfp t\u1ee5c \u0111\u01b0\u1ee3c c\u1eadp nh\u1eadt \u1edf b\u01b0\u1edbc sau.", "\u0110\u00e2y l\u00e0 c\u00e1c t\u00ean \u0111ang xu\u1ea5t hi\u1ec7n tr\u00ean n\u1ed9i dung hi\u1ec7n c\u00f3 c\u1ee7a n\u1ec1n t\u1ea3ng. H\u1ed3 s\u01a1 chi ti\u1ebft c\u00f3 th\u1ec3 ti\u1ebfp t\u1ee5c \u0111\u01b0\u1ee3c c\u1eadp nh\u1eadt \u1edf b\u01b0\u1edbc sau."),
    ("Th\u00f4ng tin gi\u1ea3ng vi\u00ean \u0111ang \u0111\u01b0\u1ee3c \u0111\u1ed3ng b\u1ed9 t\u1eeb d\u1eef li\u1ec7u kh\u00f3a h\u1ecdc v\u00e0 blog.", "Th\u00f4ng tin \u0111\u1ed9i ng\u0169 \u0111ang \u0111\u01b0\u1ee3c \u0111\u1ed3ng b\u1ed9 t\u1eeb d\u1eef li\u1ec7u kh\u00f3a h\u1ecdc v\u00e0 blog."),
    ("placeholder=\"T\u00ecm theo ch\u1ee7 \u0111\u1ec1, kh\u00f3a h\u1ecdc, gi\u1ea3ng vi\u00ean...\"", "placeholder=\"T\u00ecm theo ch\u1ee7 \u0111\u1ec1, kh\u00f3a h\u1ecdc...\""),
    ("placeholder=\"T\u00ecm theo t\u00ean t\u00e0i li\u1ec7u, kh\u00f3a h\u1ecdc, gi\u1ea3ng vi\u00ean...\"", "placeholder=\"T\u00ecm theo t\u00ean t\u00e0i li\u1ec7u, kh\u00f3a h\u1ecdc...\""),
]

for path in targets:
    text = path.read_text(encoding="utf-8")
    updated = text
    for old, new in replacements:
        updated = updated.replace(old, new)
    updated = updated.replace("Gi\u1ea3ng vi\u00ean:", "Ng\u01b0\u1eddi h\u01b0\u1edbng d\u1eabn:")
    updated = updated.replace("gi\u1ea3ng vi\u00ean", "ng\u01b0\u1eddi h\u01b0\u1edbng d\u1eabn")
    updated = updated.replace("Gi\u1ea3ng vi\u00ean", "Ng\u01b0\u1eddi h\u01b0\u1edbng d\u1eabn")
    updated = updated.replace("Blog ng\u01b0\u1eddi h\u01b0\u1edbng d\u1eabn", "Blog chuy\u00ean m\u00f4n")
    updated = updated.replace("\u0111\u1ed9i ng\u0169 ng\u01b0\u1eddi h\u01b0\u1edbng d\u1eabn GHTXDBK", "\u0111\u1ed9i ng\u0169 GHTXDBK")
    updated = updated.replace("B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n ng\u01b0\u1eddi h\u01b0\u1edbng d\u1eabn", "B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n n\u1ed9i dung")
    if updated != text:
        path.write_text(updated, encoding="utf-8")
