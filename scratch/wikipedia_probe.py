import json, time, urllib.parse, urllib.request

NAMES = [
    'Wisata Alam Arga Hot Springs Desa Wisata Sundakerta',
    'Wisata Alam Cipatuh', 'Taman Wisata Karang Resik',
    'Curug Ciparay Tasikmalaya', 'Bukit Panyangrayan', 'Pasir Pataya',
    'Pantai Karang Tawulan', 'Situ Gede', 'Kebun Teh Taraju',
    'Curug Panetean', 'Tugu Payung Geulis Tasikmalaya',
    'Pantai karang malang', 'Gunung Galunggung', 'Kampung Naga',
    'Situs Ciung Wanara', 'Taman Dadaha', 'Alun-Alun Kota Tasikmalaya',
    'TeeJay Waterpark', 'Mambo Kuliner Night', 'Green Canyon Pangandaran',
]

API = 'https://id.wikipedia.org/w/api.php'
UA = 'hyperlocal-next/0.1 (wikipedia image probe; contact: student project)'

def probe(q):
    url = API + '?' + urllib.parse.urlencode({
        'action': 'query', 'generator': 'search', 'gsrsearch': q,
        'gsrlimit': '2', 'prop': 'pageimages', 'piprop': 'thumbnail',
        'pithumbsize': '1200', 'format': 'json', 'formatversion': '2',
    })
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        d = json.loads(urllib.request.urlopen(req, timeout=20).read())
    except Exception as e:
        return f'ERR {e}'
    pages = d.get('query', {}).get('pages', [])
    out = []
    for p in pages:
        title = p.get('title')
        thumb = (p.get('thumbnail') or {}).get('source')
        out.append((title, 'THUMB' if thumb else 'no-thumb'))
    if not pages:
        return 'NO-ARTICLE'
    return '; '.join(f'{t} [{s}]' for t, s in out)

ok = 0
for name in NAMES:
    r = probe(name)
    has = 'THUMB' in r
    ok += 1 if has else 0
    print(f'{"HIT " if has else "miss"} | {name[:45]:45s} | {r[:90]}')
    time.sleep(0.6)
print(f'---\n{ok}/{len(NAMES)} dengan thumbnail Wikipedia bahasa Indonesia')
