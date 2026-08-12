# Designer cards — the originals

The masters the salon supplied, one finished card per person: portrait on
top, then the black block carrying name, number and 擅長項目 in AT13's own
layout. Everything the team section shows was taken from these, so keep them
— the portraits on the site cannot be regenerated at full quality without
them.

| File | Designer | Card says |
| --- | --- | --- |
| `no00-eric.png` | Eric | 0號設計師・副理 |
| `no05-sunny.png` | Sunny（阿晴） | 5號設計師 |
| `no06-wenny.png` | Wenny（胖胖） | 6號設計師 |
| `no07-gaga.png` | 嘎嘎 | 7號設計師 |
| `no08-jerry.png` | Jerry（仁傑） | 8號設計師 |
| `no10-amy.png` | AMY | 10號設計師 |
| `no11-qiqi.png` | 七七（萱秦） | 11號設計師 |
| `no12-wendy.png` | Wendy | 12號設計師 |
| `no13-yuanyuan.png` | 垣垣（垣潔） | 13號設計師 |
| `front-mary.png` | 瑪莉 | 櫃台公關 |

Received 2026-08-12, all 1600px wide.

Two things differ between the cards and the site on purpose. The names lost
their parenthesised given names for 8號, 11號 and 13號 at the owner's
request — 5號 and 6號 keep theirs, since 阿晴 and 胖胖 are the nicknames
they go by. And 櫃台 is spelled 瑪莉 on the site, 瑪利 on the card.

## Regenerating the portraits

`tools/crop-designer-cards.py` crops the photo out of each card to 3:4 —
starting below the wordmark overlay burned into the top of the frame,
centred on the face — and writes `public/assets/gen/{,tex/,thumb/}<id>.webp`
at 1200×1600, 768×1024 and 400×533. The crop box for each card is a table at
the top of that script; adjust `face_x` there if a crop wants recentring.

```bash
python3 tools/crop-designer-cards.py
```

The wording on the cards is not baked into the images: it lives in the
roster in `public/assets/content-DRgEOFBw.js`, so it stays selectable,
translatable into English, and responsive. Changing a designer's details
means editing that roster, not the card.
