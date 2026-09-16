# Generates the round-one artboards. Static mockups, one file per artboard.
import json, html

DIRS = {
  "A": dict(
    name="Set table", key="SetTable",
    bg="#F3EEE4", surface="#FBF8F2", ink="#1F1B17", muted="#6B625A", line="#E1D9CB",
    accent="#2E5C4F", accent_soft="#E4EDE7", up_accent="#1F5FA8",
    display="'Newsreader', Georgia, 'Times New Roman', serif", body="'Source Sans 3', 'Helvetica Neue', Arial, sans-serif",
    fonts="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Source+Sans+3:wght@400;600&display=swap",
    radius="10px", btn_radius="10px", title_size="40px", title_weight="500", title_ls="-0.01em", eyebrow_style="letter-spacing:0.14em;text-transform:uppercase;font-size:12px;font-weight:600;",
    motivation="Warm neutrals, a paper ground, a serious serif for titles and a plain sans for everything else. The app is the good plate under the invite.",
    tradeoff="Risk: reads formal if the type gets too elegant. Kept the serif to titles only and used deep green, not terracotta, to stay clear of the default 'AI cream' look."),
  "B": dict(
    name="Brisbane light", key="BrisbaneLight",
    bg="#FFFFFF", surface="#FFF8EE", ink="#1B1B1F", muted="#66666E", line="#EDE6DA",
    accent="#E8891F", accent_soft="#FFF1DE", up_accent="#2B8DE8",
    display="'Outfit', 'Avenir Next', 'Segoe UI', sans-serif", body="'Nunito Sans', 'Helvetica Neue', Arial, sans-serif",
    fonts="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&family=Nunito+Sans:wght@400;700&display=swap",
    radius="18px", btn_radius="999px", title_size="38px", title_weight="700", title_ls="-0.02em", eyebrow_style="font-size:14px;font-weight:700;",
    motivation="Bright white, a warm sun-coloured accent by default, big rounded friendly type, chips and pills, a small sun mark. Playful without being for kids.",
    tradeoff="Risk: drifts toward Partiful if gradients creep in. No gradients anywhere; the warmth comes from one accent and a cream card tint."),
  "C": dict(
    name="Quiet host", key="QuietHost",
    bg="#FFFFFF", surface="#F5F5F4", ink="#111111", muted="#6A6A66", line="#E4E4E1",
    accent="#111111", accent_soft="#EEEEEC", up_accent="#2B8DE8",
    display="'Manrope', 'Helvetica Neue', Arial, sans-serif", body="'Manrope', 'Helvetica Neue', Arial, sans-serif",
    fonts="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap",
    radius="6px", btn_radius="6px", title_size="36px", title_weight="800", title_ls="-0.03em", eyebrow_style="letter-spacing:0.08em;text-transform:uppercase;font-size:12px;font-weight:600;",
    motivation="Almost no colour of its own: black, white, one grey, and the accent taken from the invite. Editorial grid, precise spacing, the artwork does the talking.",
    tradeoff="Risk: cold when there is no artwork. The text-only version leans on scale and spacing to carry warmth instead of colour."),
}


ICONS = {
  "clock": '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
  "pin": '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"></path><circle cx="12" cy="10" r="2.5"></circle>',
  "grill": '<path d="M4 9h16"></path><path d="M6 9a6 6 0 0 0 12 0"></path><path d="M12 15v6M8 21l2-4M16 21l-2-4"></path><path d="M9 5c0-1 1-1 1-2M13 5c0-1 1-1 1-2"></path>',
  "bag": '<path d="M6 8h12l1 13H5L6 8z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path>',
  "gift": '<rect x="4" y="10" width="16" height="11" rx="1.5"></rect><path d="M4 14h16M12 10v11M12 10c-2 0-4-1-4-3s3-2 4 3c1-5 4-5 4-3s-2 3-4 3z"></path>',
  "kids": '<circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="10" r="2.2"></circle><path d="M3 21v-2a6 6 0 0 1 12 0v2M14 21v-1.5a4 4 0 0 1 7 0V21"></path>',
  "car": '<path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16"></path><rect x="3" y="16" width="18" height="4" rx="1"></rect><path d="M6 20v1M18 20v1M7 13h10"></path>',
  "shower": '<path d="M5 5a4 4 0 0 1 7 2h3a4 4 0 0 1 4 4v1H9v-1a4 4 0 0 1 1-2.6"></path><path d="M9 15v1M12 15v3M15 15v1M12 20v1"></path>',
  "calendar": '<rect x="4" y="5" width="16" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4"></path>',
}
def icon(name, color):
    return f'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 20px;margin-top:2px">{ICONS[name]}</svg>'

def sun_svg(color):
    return f'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"></path></svg>'

def pin_svg(color):
    return f'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>'

def poster():
    # A stand-in for the host's own uploaded Canva design: loud, portrait, nothing to do with the app's palette.
    return '''
<div style="position:relative;width:326px;height:435px;border-radius:14px;overflow:hidden;background:#2B8DE8;font-family:'Outfit','Arial Black',sans-serif;color:#FFFFFF;box-shadow:0 14px 30px -18px rgba(0,0,0,0.45)">
  <div style="position:absolute;left:-40px;top:250px;width:420px;height:260px;background:#1B6FC2;border-radius:50% 50% 0 0"></div>
  <div style="position:absolute;left:-60px;top:300px;width:460px;height:260px;background:#155A9E;border-radius:50% 50% 0 0"></div>
  <div style="position:absolute;right:22px;top:22px;width:74px;height:74px;border-radius:50%;background:#FFD54A"></div>
  <div style="position:absolute;left:0;right:0;top:0;padding:28px 24px;display:flex;flex-direction:column;gap:6px">
    <div style="font-size:14px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:#FFD54A">Splash!</div>
    <div style="font-size:44px;line-height:0.95;font-weight:700;text-transform:uppercase">Leo is<br>turning 6</div>
    <div style="font-size:20px;font-weight:600;margin-top:8px">Pool party</div>
  </div>
  <div style="position:absolute;left:24px;right:24px;bottom:26px;display:flex;flex-direction:column;gap:4px;font-weight:600;font-size:14px">
    <div>Saturday 14 November, 2 to 4pm</div>
    <div>12 Example Street, Paddington</div>
    <div style="font-size:12px;opacity:0.85">Bring your swimmers!</div>
  </div>
</div>'''

def page(d, mode):
    upload = mode == "upload"
    outfit_link = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&display=swap">' if upload else ''
    accent = d["up_accent"] if upload else d["accent"]
    acc_text = "#FFFFFF"
    eyebrow = d["eyebrow_style"]
    mark = sun_svg(accent) if d["key"] == "BrisbaneLight" else ""
    def sec(name, body):
        return f'''
<div style="display:flex;gap:12px;align-items:flex-start">
  {icon(name, accent)}
  <div style="font-size:16px;line-height:1.5;color:{d['ink']}">{body}</div>
</div>'''
    hero = poster() if upload else f'''
<div style="display:flex;flex-direction:column;gap:10px;padding:8px 0 4px">
  <div style="font-family:{d['display']};font-size:{d['title_size']};font-weight:{d['title_weight']};letter-spacing:{d['title_ls']};line-height:1.02;color:{d['ink']}">Leo is turning 6</div>
  <div style="font-size:17px;line-height:1.5;color:{d['ink']}">A pool party in the backyard. Come for a swim, a sausage and some cake.</div>
</div>'''
    strip = f'''
<div style="display:flex;flex-direction:column;gap:14px;padding:16px;background:{d['surface']};border:1px solid {d['line']};border-radius:{d['radius']}">
  {sec("clock", "Saturday 14 November, 2 to 4pm")}
  {sec("pin", "12 Example Street, Paddington")}
  {sec("car", "Use the visitor carpark, entry off Latrobe Terrace.")}
  {sec("shower", "Showers and change rooms available, plenty of shade.")}
  <a href="#" style="display:inline-flex;align-items:center;gap:6px;align-self:flex-start;font-size:14px;font-weight:600;color:{accent};text-decoration:none;border:1.5px solid {accent};border-radius:{d['btn_radius']};min-height:44px;padding:10px 14px;box-sizing:border-box">{pin_svg(accent)}Open in Maps</a>
</div>'''
    details = f'''
<div style="display:flex;flex-direction:column;gap:18px">
  {sec("grill", "We'll have a BBQ going.")}
  {sec("bag", "Swimmers, towel and a rashie. We have sunscreen.")}
  {sec("gift", "Gifts are entirely optional. If you'd like to join in, there's also a group gift: Sarah is organising it, details after you reply.")}
  {sec("kids", "Stay or drop off, whatever suits you. We're keeping it to invited kids only. Sorry, siblings!")}
  {sec("calendar", "Please reply by 1 November so we can get the numbers right.")}
</div>'''
    rsvp = f'''
<div style="display:flex;flex-direction:column;gap:12px;padding:20px 16px 22px;background:{d['surface']};border:1px solid {d['line']};border-radius:{d['radius']}">
  <div style="font-family:{d['display']};font-size:26px;font-weight:{d['title_weight']};letter-spacing:{d['title_ls']};line-height:1.1;color:{d['ink']}">Can Oliver make it?</div>
  <a href="#" style="display:flex;align-items:center;justify-content:center;min-height:56px;padding:0 18px;border-radius:{d['btn_radius']};background:{accent};color:{acc_text};font-size:18px;font-weight:700;text-decoration:none">Yes, we're coming</a>
  <a href="#" style="display:flex;align-items:center;justify-content:center;min-height:56px;padding:0 18px;border-radius:{d['btn_radius']};border:1.5px solid {d['line']};background:{d['bg']};color:{d['ink']};font-size:18px;font-weight:700;text-decoration:none">Sorry, can't make it</a>
  <div style="font-size:14px;color:{d['muted']};line-height:1.5">One tap. We'll ask how many and about any allergies next.</div>
</div>'''
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{d['fonts']}">
  {outfit_link}
  <style>
    body {{ margin: 0; background: {d['bg']}; }}
    a {{ color: {accent}; }} a:hover {{ color: {d['ink']}; }}
  </style>
</helmet>
<div style="width:390px;min-height:{1720 if upload else 1640}px;background:{d['bg']};font-family:{d['body']};color:{d['ink']};display:flex;flex-direction:column;gap:22px;padding:28px 20px 40px;box-sizing:border-box">
  <div style="display:flex;align-items:center;gap:8px;color:{accent};{eyebrow}">{mark}<span>Hi Oliver, you're invited</span></div>
  {hero}
  {strip}
  {details}
  {rsvp}
  <div style="display:flex;flex-direction:column;gap:4px;align-items:center;font-size:13px;color:{d['muted']};text-align:center">
    <span>Questions? Text Leo's mum</span>
    <span>Not Oliver? <a href="#" style="color:{accent}">Reply here instead</a></span>
  </div>
</div>
</x-dc>
</body>
</html>'''

NAMES = [
  ("Who's In", "whosin.app", "The question every host asks. The yes button is the answer.", "Wordmark: two words, the apostrophe as a small tilted mark."),
  ("Headcount", "headcount.app", "Says exactly what the host wants. Plain, confident, grown-up.", "Wordmark: one word, heavy sans, the 'o' as a small counter ring."),
  ("Cooee", "cooee.app", "The Australian call to gather. Distinctive and ownable, hard to copy.", "Wordmark: rounded lowercase, the double 'o' as two speech bubbles."),
  ("Rollup", "rollup.app", "A good roll-up is a good turnout. Playful, a little carnival.", "Wordmark: lowercase with a curl on the 'R', like a rolled flag."),
  ("Bunting", "bunting.app", "The string of flags at every party, kids' or grown-up. Warm and original.", "Wordmark: a small pennant string under the word, never emoji."),
]
ALSO = [("Turnout", "clean, a little municipal"), ("Yep", "fun, hard to search for"), ("Sorted", "generic in Australia"), ("Pop In", "casual, common phrase"), ("Pencil Me In", "lovely, too long for a text"), ("Count Me In", "taken by two apps"), ("Rollcall", "taken by an invitation app"), ("Yeah Nah", "means no")]

def names_board():
    cards = ""
    for i, (n, dom, story, mark) in enumerate(NAMES):
        code = "k7m2p"
        cards += f'''
<div style="display:flex;flex-direction:column;gap:12px;padding:20px;background:#FFFFFF;border:1px solid #E4E4E1;border-radius:12px">
  <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#6A6A66;font-weight:600">Option {i+1}</div>
  <div style="font-family:'Manrope',sans-serif;font-size:34px;font-weight:800;letter-spacing:-0.03em;line-height:1;color:#111111">{html.escape(n)}</div>
  <div style="font-size:15px;line-height:1.5;color:#111111">{html.escape(story)}</div>
  <div style="font-size:13px;line-height:1.5;color:#6A6A66">{html.escape(mark)}</div>
  <div style="display:flex;flex-direction:column;gap:6px;padding:12px 14px;background:#F5F5F4;border-radius:10px;font-size:13px;line-height:1.5;color:#111111">
    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6A6A66;font-weight:600">In the text</div>
    <div>Hi Tom! You're invited to Leo's 6th. See the details and RSVP: {dom}/i/{code}</div>
  </div>
</div>'''
    also = "".join(f'<div style="display:flex;gap:8px;align-items:baseline;font-size:14px"><b style="color:#111111">{html.escape(a)}</b><span style="color:#6A6A66">{html.escape(b)}</span></div>' for a, b in ALSO)
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap">
  <style>
    body {{ margin: 0; background: #FAFAF8; }}
    a {{ color: #111111; }} a:hover {{ color: #6A6A66; }}
  </style>
</helmet>
<div style="width:1240px;min-height:820px;background:#FAFAF8;font-family:'Manrope','Helvetica Neue',Arial,sans-serif;color:#111111;display:flex;flex-direction:column;gap:22px;padding:36px 40px;box-sizing:border-box">
  <div style="display:flex;flex-direction:column;gap:6px">
    <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#6A6A66;font-weight:600">Round one, name shortlist</div>
    <div style="font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.1">Five names, each read inside the text a guest receives</div>
    <div style="font-size:15px;color:#6A6A66;max-width:70ch;line-height:1.5">Criteria from the brief: works in a text message, no 'vite' or 'invit', warm not childish, usable in Australia. Domain and trademark checks are Marcia's final call; nothing here is confirmed available.</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:14px">{cards}</div>
  <div style="display:flex;flex-direction:column;gap:10px;padding:18px 20px;background:#FFFFFF;border:1px solid #E4E4E1;border-radius:12px">
    <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#6A6A66;font-weight:600">Also considered</div>
    <div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:8px 24px">{also}</div>
  </div>
</div>
</x-dc>
</body>
</html>'''

open("Names.dc.html", "w").write(names_board())
boards = [{"file": "Names.dc.html", "x": 0, "y": 0, "w": 1240, "h": 820, "title": "Names"}]
notes = []
x = 0
for k in ["A", "B", "C"]:
    d = DIRS[k]
    for mode, suffix in (("upload", "Upload"), ("text", "TextOnly")):
        fn = f"{d['key']}{suffix}.dc.html"
        open(fn, "w").write(page(d, mode))
        boards.append({"file": fn, "x": x, "y": 1160, "w": 390, "h": (1720 if mode=="upload" else 1640), "title": f"{k}. {d['name']}: {'uploaded invite' if mode=='upload' else 'text only'}"})
        x += 480
    notes.append({"id": f"dir-{k.lower()}", "x": x - 960, "y": 880, "w": 860, "text": f"Direction {k}: {d['name']}\n{d['motivation']}\n{d['tradeoff']}"})
    x += 120
canvas = {"artboards": boards, "annotations": notes + [{"id": "how-to-read", "x": 1300, "y": 0, "w": 420, "text": "How to read this canvas\nTop: five names, each shown inside the default text message.\nBelow: three visual directions. For each, the guest invite page twice: under a loud uploaded invite (the host's own artwork, here a stand-in poster) and as text only. The accent colour in the uploaded version is taken from the poster, which is how the real app will behave.\nAll copy is the approved default wording from the journeys page. Pick a name and a direction, or mix: one direction's type with another's colour is a fair ask."}], "launch": {"view": "canvas"}}
json.dump(canvas, open("canvas.json", "w"), indent=2)
print("wrote", len(boards), "artboards")
