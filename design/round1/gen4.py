# Page 4: decisions read from Marcia's Pinterest board, and the strip dressed in them.
import json

PAL = dict(cream="#F6EFE1", paper="#FBF7EF", terracotta="#D96C3F", mustard="#E8B33A", sage="#9DB58C", olive="#4F6B4A", pink="#E7A9B5", burgundy="#8C2F39", cobalt="#2F5DA8", ink="#2A2320")
FONTS = "https://fonts.googleapis.com/css2?family=Lilita+One&family=Patrick+Hand+SC&family=Nunito:wght@400;700;800&display=swap"
DISPLAY = "'Lilita One', 'Arial Rounded MT Bold', sans-serif"
HAND = "'Patrick Hand SC', cursive"
BODY = "'Nunito', 'Helvetica Neue', Arial, sans-serif"

def gingham(c):
    return f"background-color:#FFFFFF;background-image:linear-gradient(90deg, {c}55 50%, transparent 50%), linear-gradient({c}55 50%, transparent 50%);background-size:22px 22px;"

def stripes(c):
    return f"background-image:repeating-linear-gradient(90deg, {c} 0 14px, #FFFFFF 14px 28px);"

# Flat cut-paper shapes, no outlines.
def sun(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><circle cx="32" cy="32" r="14" fill="{PAL["mustard"]}"/><g fill="{PAL["terracotta"]}"><path d="M32 4l4 10h-8zM32 60l-4-10h8zM4 32l10-4v8zM60 32l-10 4v-8zM12 12l10 4-6 6zM52 52l-10-4 6-6zM12 52l4-10 6 6zM52 12l-4 10-6-6z"/></g></svg>'
def wave(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M4 40c8-12 18-12 26 0s18 12 26 0v20H4z" fill="{PAL["cobalt"]}"/><path d="M4 48c8-8 18-8 26 0s18 8 26 0v12H4z" fill="{PAL["sage"]}"/><circle cx="34" cy="34" r="4" fill="#FFFFFF"/></svg>'
def ring(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><circle cx="32" cy="34" r="22" fill="{PAL["pink"]}"/><circle cx="32" cy="34" r="10" fill="{PAL["paper"]}"/><path d="M32 12a22 22 0 0 1 22 22h-12a10 10 0 0 0-10-10z" fill="#FFFFFF"/><path d="M32 56a22 22 0 0 1-22-22h12a10 10 0 0 0 10 10z" fill="#FFFFFF"/></svg>'
def balloon(size=72, c=None):
    c = c or PAL["terracotta"]
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M32 6c-10 0-17 8-17 18 0 12 10 20 17 24 7-4 17-12 17-24 0-10-7-18-17-18z" fill="{c}"/><path d="M30 48l2 4-2 4 2 4" stroke="{PAL["ink"]}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="26" cy="18" r="3" fill="#FFFFFF" opacity="0.7"/></svg>'
def cake(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="12" y="34" width="40" height="22" rx="3" fill="{PAL["pink"]}"/><path d="M12 38c6 6 10-4 16 2s10-4 16 2 6-2 8 0v-4H12z" fill="{PAL["burgundy"]}"/><rect x="18" y="22" width="4" height="12" fill="{PAL["sage"]}"/><rect x="30" y="20" width="4" height="14" fill="{PAL["cobalt"]}"/><rect x="42" y="22" width="4" height="12" fill="{PAL["mustard"]}"/><circle cx="20" cy="18" r="3" fill="{PAL["terracotta"]}"/><circle cx="32" cy="16" r="3" fill="{PAL["terracotta"]}"/><circle cx="44" cy="18" r="3" fill="{PAL["terracotta"]}"/></svg>'
def sausage(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="8" y="30" width="48" height="18" rx="9" fill="{PAL["mustard"]}"/><rect x="12" y="34" width="40" height="10" rx="5" fill="{PAL["terracotta"]}"/><path d="M20 32c4-6 8-6 12 0s8 6 12 0" stroke="{PAL["burgundy"]}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>'
def car(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M10 40l6-12h32l6 12z" fill="{PAL["sage"]}"/><rect x="6" y="38" width="52" height="14" rx="4" fill="{PAL["olive"]}"/><circle cx="18" cy="54" r="5" fill="{PAL["ink"]}"/><circle cx="46" cy="54" r="5" fill="{PAL["ink"]}"/><rect x="20" y="30" width="10" height="8" fill="#FFFFFF" opacity="0.8"/><rect x="34" y="30" width="10" height="8" fill="#FFFFFF" opacity="0.8"/></svg>'
def towel(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="14" y="10" width="36" height="44" rx="3" fill="{PAL["cobalt"]}"/><rect x="14" y="22" width="36" height="6" fill="#FFFFFF"/><rect x="14" y="36" width="36" height="6" fill="#FFFFFF"/></svg>'
def gift(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="12" y="26" width="40" height="30" rx="3" fill="{PAL["terracotta"]}"/><rect x="28" y="26" width="8" height="30" fill="{PAL["mustard"]}"/><rect x="10" y="22" width="44" height="8" rx="2" fill="{PAL["burgundy"]}"/><path d="M32 22c-8 0-12-6-10-10s8-2 10 6c2-8 8-10 10-6s-2 10-10 10z" fill="{PAL["mustard"]}"/></svg>'
def kids(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><circle cx="22" cy="18" r="8" fill="{PAL["pink"]}"/><circle cx="44" cy="24" r="6" fill="{PAL["sage"]}"/><path d="M8 56v-8a14 14 0 0 1 28 0v8z" fill="{PAL["cobalt"]}"/><path d="M36 56v-5a9 9 0 0 1 18 0v5z" fill="{PAL["olive"]}"/></svg>'
def gate(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="10" y="22" width="44" height="34" fill="{PAL["sage"]}"/><rect x="10" y="22" width="6" height="34" fill="{PAL["olive"]}"/><rect x="24" y="22" width="6" height="34" fill="{PAL["olive"]}"/><rect x="38" y="22" width="6" height="34" fill="{PAL["olive"]}"/><path d="M10 24c14-12 30-12 44 0v6H10z" fill="{PAL["olive"]}"/></svg>'
def camera(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="8" y="20" width="48" height="32" rx="6" fill="{PAL["olive"]}"/><circle cx="32" cy="36" r="10" fill="{PAL["cream"]}"/><circle cx="32" cy="36" r="5" fill="{PAL["cobalt"]}"/><rect x="22" y="12" width="20" height="10" rx="3" fill="{PAL["sage"]}"/></svg>'
def bubble(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M10 12h44v28H30l-12 12V40h-8z" fill="{PAL["mustard"]}"/><circle cx="22" cy="26" r="3" fill="{PAL["ink"]}"/><circle cx="32" cy="26" r="3" fill="{PAL["ink"]}"/><circle cx="42" cy="26" r="3" fill="{PAL["ink"]}"/></svg>'
def waratah(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M32 60V34" stroke="{PAL["olive"]}" stroke-width="4" stroke-linecap="round"/><path d="M32 48c-8 0-14-4-16-10 8 0 14 2 16 10zM32 48c8 0 14-4 16-10-8 0-14 2-16 10z" fill="{PAL["sage"]}"/><circle cx="32" cy="24" r="14" fill="{PAL["burgundy"]}"/><circle cx="32" cy="22" r="8" fill="{PAL["terracotta"]}"/></svg>'
def wattle(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M14 58C24 44 34 30 52 12" stroke="{PAL["olive"]}" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="{PAL["mustard"]}"><circle cx="24" cy="44" r="5"/><circle cx="32" cy="36" r="5"/><circle cx="40" cy="28" r="5"/><circle cx="30" cy="48" r="4"/><circle cx="38" cy="40" r="4"/><circle cx="46" cy="32" r="4"/><circle cx="46" cy="20" r="5"/></g></svg>'
def glasses(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M12 10h18l-2 18a7 7 0 0 1-14 0z" fill="{PAL["pink"]}"/><rect x="19" y="34" width="4" height="16" fill="{PAL["burgundy"]}"/><rect x="12" y="50" width="18" height="4" rx="2" fill="{PAL["burgundy"]}"/><path d="M38 20l14 6-6 22-14-6z" fill="{PAL["mustard"]}"/><path d="M42 26l8 3" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/></svg>'
def disco(size=72):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><circle cx="32" cy="36" r="18" fill="{PAL["cobalt"]}"/><g fill="#FFFFFF" opacity="0.7"><rect x="22" y="26" width="6" height="6"/><rect x="34" y="26" width="6" height="6"/><rect x="28" y="34" width="6" height="6"/><rect x="40" y="34" width="6" height="6"/><rect x="18" y="34" width="6" height="6"/><rect x="22" y="42" width="6" height="6"/><rect x="34" y="42" width="6" height="6"/></g><rect x="30" y="8" width="4" height="10" fill="{PAL["ink"]}"/></svg>'

def title(t, size=44, font=DISPLAY, color=PAL["ink"]):
    return f'<div style="font-family:{font};font-size:{size}px;line-height:1.02;text-align:center;color:{color}">{t}</div>'
def para(t, size=16, color=PAL["ink"]):
    return f'<div style="font-size:{size}px;line-height:1.5;text-align:center;max-width:300px;color:{color}">{t}</div>'
def label(t, c):
    return f'<div style="font-family:{HAND};font-size:22px;letter-spacing:0.06em;text-align:center;color:{c}">{t}</div>'
def icon_line(icon, t):
    return f'<div style="display:flex;gap:14px;align-items:center;max-width:330px">{icon}<div style="font-size:16px;line-height:1.45;flex:1;color:{PAL["ink"]}">{t}</div></div>'
def stop(t, icon, name, body, c):
    return f'''<div style="display:grid;grid-template-columns:52px 60px 1fr;gap:10px;align-items:start">
  <div style="font-family:{DISPLAY};font-size:20px;text-align:right;padding-top:14px;color:{c}">{t}</div>
  <div style="display:flex;justify-content:center">{icon}</div>
  <div style="padding-top:10px"><div style="font-family:{DISPLAY};font-size:22px;line-height:1;color:{PAL["ink"]}">{name}</div><div style="font-size:15px;line-height:1.45;color:{PAL["ink"]};opacity:0.78">{body}</div></div>
</div>'''
def btn(t, bg, fg, border=None):
    b = f"border:2px solid {border};" if border else ""
    return f'<a href="#" style="display:flex;align-items:center;justify-content:center;min-height:56px;width:310px;border-radius:16px;background:{bg};color:{fg};font-family:{DISPLAY};font-size:20px;text-decoration:none;{b}">{t}</a>'
def band(inner, style):
    return f'<div style="width:390px;margin:0 -22px;padding:26px 22px;display:flex;flex-direction:column;align-items:center;gap:14px;{style}">{inner}</div>'
def sticker(t, bg, rot):
    return f'<div style="background:{bg};color:#FFFFFF;font-family:{DISPLAY};font-size:16px;padding:6px 12px;border-radius:999px;transform:rotate({rot}deg)">{t}</div>'

def shell(body, h, bg):
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{FONTS}">
  <style>
    body {{ margin: 0; background: {bg}; }}
    a {{ color: {PAL["cobalt"]}; }} a:hover {{ opacity: 0.85; }}
  </style>
</helmet>
<div style="width:390px;min-height:{h}px;background:{bg};font-family:{BODY};color:{PAL["ink"]};display:flex;flex-direction:column;align-items:center;gap:26px;padding:0 22px 40px;box-sizing:border-box;overflow:hidden">
{body}
</div>
</x-dc>
</body>
</html>'''

# Strip 1: Leo's pool party, "Summer" set: gingham band, cut-paper shapes, chunky lettering.
pool = "\n".join([
  band(
    f'<div style="font-family:{HAND};font-size:18px;letter-spacing:0.1em;color:{PAL["ink"]}">HI OLIVER, YOU\'RE INVITED</div>'
    f'<div style="display:flex;gap:6px;align-items:flex-end">{balloon(64, PAL["terracotta"])}{sun(84)}{ring(64)}</div>'
    + title("Leo is<br>turning 6!", 58)
    + f'<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">{sticker("Pool party", PAL["cobalt"], -3)}{sticker("Sat 14 Nov", PAL["terracotta"], 2)}{sticker("2 to 4pm", PAL["olive"], -1)}</div>',
    gingham(PAL["sage"]) + "padding-top:34px;padding-bottom:30px;"),
  para("Come for a swim, a sausage and some cake at our building's pool."),
  '<div style="display:flex;flex-direction:column;gap:8px;align-items:center">' + label("THE DETAILS", PAL["terracotta"]) + para("Saturday 14 November, 2 to 4pm<br><b>12 Example Street, Paddington</b>")
    + f'<a href="#" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:999px;background:{PAL["cobalt"]};color:#FFFFFF;text-decoration:none;font-weight:800;margin-top:4px">Open in Maps</a></div>',
  band(label("THE DAY", PAL["burgundy"]) + '<div style="display:flex;flex-direction:column;gap:14px;width:100%">' + "\n".join([
      stop("2:00", gate(56), "Arrive", "Visitor carpark, entry off Example Street. We'll meet you at the pool gate.", PAL["terracotta"]),
      stop("2:15", wave(56), "Swim", "Showers and change rooms, plenty of shade.", PAL["cobalt"]),
      stop("3:15", cake(56), "Cake and BBQ", "We'll have a BBQ going. Tell us about allergies when you reply.", PAL["burgundy"]),
      stop("4:00", car(56), "Pick up", "Parents welcome to stay or drop off.", PAL["olive"]),
    ]) + '</div>', f"background:{PAL['cream']};"),
  label("GOOD TO KNOW", PAL["olive"]),
  '<div style="display:flex;flex-direction:column;gap:14px">' + icon_line(towel(52), "Swimmers, towel and a rashie. We have sunscreen.") + icon_line(gift(52), "Gifts are entirely optional. There's also a group gift, Sarah is organising it.") + icon_line(kids(52), "We're keeping it to invited kids only. Sorry, siblings!") + '</div>',
  band(title("RSVP", 72, DISPLAY, PAL["cream"]) + para("Can Oliver make it? Please reply by 1 November.", 16, PAL["cream"]) + btn("Yes, we're coming!", PAL["mustard"], PAL["ink"]) + btn("Sorry, can't make it", "transparent", PAL["cream"], PAL["cream"]), f"background:{PAL['terracotta']};padding-top:30px;padding-bottom:34px;"),
  '<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:16px;width:100%">'
  + f'<div style="display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center">{bubble(52)}<div style="font-family:{DISPLAY};font-size:20px">Updates</div><div style="font-size:14px;opacity:0.78">Anything that changes shows here.</div></div>'
  + f'<div style="display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center">{camera(52)}<div style="font-family:{DISPLAY};font-size:20px">Photos</div><div style="font-size:14px;opacity:0.78">A photo for you after the party.</div></div></div>',
  f'<div style="font-family:{HAND};font-size:18px;letter-spacing:0.06em;opacity:0.7">WITH LOVE FROM LEO\'S MUM AND DAD</div>',
])
open("BoardPoolParty.dc.html","w").write(shell(pool, 2140, PAL["paper"]))

# Strip 2: Marcia's birthday drinks, "Native garden" set: stripes band, waratah and wattle, olive and terracotta.
drinks = "\n".join([
  band(
    f'<div style="font-family:{HAND};font-size:18px;letter-spacing:0.1em;color:{PAL["ink"]}">HI TOM, YOU\'RE INVITED</div>'
    f'<div style="display:flex;gap:6px;align-items:flex-end">{wattle(64)}{waratah(84)}{glasses(64)}</div>'
    + title("Marcia's<br>birthday drinks", 50)
    + f'<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">{sticker("Fri 21 Nov", PAL["burgundy"], -2)}{sticker("from 6:30pm", PAL["olive"], 2)}</div>',
    stripes(PAL["sage"] + "66") + "padding-top:34px;padding-bottom:30px;"),
  para("A Friday night at the pub, no speeches, one good playlist."),
  '<div style="display:flex;flex-direction:column;gap:8px;align-items:center">' + label("THE DETAILS", PAL["burgundy"]) + para("Friday 21 November, from 6:30pm<br><b>The Paddo Tavern, upstairs bar</b>")
    + f'<a href="#" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:999px;background:{PAL["olive"]};color:#FFFFFF;text-decoration:none;font-weight:800;margin-top:4px">Open in Maps</a></div>',
  band(label("THE NIGHT", PAL["terracotta"]) + '<div style="display:flex;flex-direction:column;gap:14px;width:100%">' + "\n".join([
      stop("6:30", glasses(56), "Drinks", "Bar tab open for the first hour. Come whenever.", PAL["burgundy"]),
      stop("8:00", cake(56), "Cake", "Very small, very chocolate.", PAL["terracotta"]),
      stop("late", disco(56), "Dancing", "The playlist is not up for discussion.", PAL["cobalt"]),
    ]) + '</div>', f"background:{PAL['cream']};"),
  '<div style="display:flex;flex-direction:column;gap:14px">' + icon_line(gift(52), "No gifts please. Your company is the present.") + icon_line(kids(52), "Bring a partner or a friend. We'll ask how many when you reply.") + '</div>',
  band(title("RSVP", 72, DISPLAY, PAL["cream"]) + para("Can you make it? Please reply by 14 November.", 16, PAL["cream"]) + btn("Yes, I'm in!", PAL["mustard"], PAL["ink"]) + btn("Sorry, can't", "transparent", PAL["cream"], PAL["cream"]), f"background:{PAL['olive']};padding-top:30px;padding-bottom:34px;"),
  f'<div style="font-family:{HAND};font-size:18px;letter-spacing:0.06em;opacity:0.7">WITH LOVE FROM MARCIA</div>',
])
open("BoardBirthdayDrinks.dc.html","w").write(shell(drinks, 1720, PAL["paper"]))

# Decisions board
def sw(name, hexv):
    return f'<div style="display:flex;flex-direction:column;gap:6px;align-items:center"><div style="width:72px;height:72px;border-radius:16px;background:{hexv}"></div><div style="font-size:13px">{name}</div><div style="font-size:12px;opacity:0.6">{hexv}</div></div>'
decisions = f'''
<div style="display:flex;flex-direction:column;gap:6px">
  <div style="font-family:{HAND};font-size:20px;letter-spacing:0.1em;color:{PAL["terracotta"]}">READ FROM THE BUNTING BOARD</div>
  <div style="font-family:{DISPLAY};font-size:40px;line-height:1">Warm, cut-paper, a little retro, very Australian</div>
  <div style="font-size:15px;opacity:0.78;max-width:80ch;line-height:1.5">The pins agree on more than they disagree. This is the direction they make together: the paper warmth of Set table, the playfulness of Brisbane light turned up with pattern and colour, none of Quiet host. Everything here is a decision to react to, not a rule.</div>
</div>
<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:20px">
  <div style="display:flex;flex-direction:column;gap:12px;padding:20px;background:#FFFFFF;border-radius:16px">
    <div style="font-family:{DISPLAY};font-size:22px">Colour</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px">{sw("cream", PAL["cream"])}{sw("terracotta", PAL["terracotta"])}{sw("mustard", PAL["mustard"])}{sw("sage", PAL["sage"])}{sw("olive", PAL["olive"])}{sw("dusty pink", PAL["pink"])}{sw("burgundy", PAL["burgundy"])}{sw("cobalt", PAL["cobalt"])}</div>
    <div style="font-size:14px;opacity:0.78;line-height:1.5">Earthy and warm, never pastel. Cream is the ground; cobalt is the one cool colour, used for punch. From the Summer Abstract palette pin, the Earth Greetings card and the terracotta prints.</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:12px;padding:20px;background:#FFFFFF;border-radius:16px">
    <div style="font-family:{DISPLAY};font-size:22px">Type</div>
    <div style="font-family:{DISPLAY};font-size:34px;line-height:1">Lilita One for titles</div>
    <div style="font-family:{HAND};font-size:26px;letter-spacing:0.08em">PATRICK HAND SC FOR LABELS</div>
    <div style="font-family:{BODY};font-size:16px">Nunito for everything you read.</div>
    <div style="font-size:14px;opacity:0.78;line-height:1.5">Chunky and cheerful, like "LET'S DO THIS" and "CHILL", never thin. Stand-ins from Google Fonts; a custom or licensed display face can replace Lilita later. The quiet set swaps the chunky face for spaced caps.</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:12px;padding:20px;background:#FFFFFF;border-radius:16px">
    <div style="font-family:{DISPLAY};font-size:22px">Pattern and shape</div>
    <div style="display:flex;gap:10px"><div style="width:72px;height:72px;border-radius:12px;{gingham(PAL["sage"])}"></div><div style="width:72px;height:72px;border-radius:12px;{stripes(PAL["pink"])}"></div><div style="width:72px;height:72px;border-radius:12px;background:{PAL["mustard"]}"></div><div style="width:72px;height:72px;border-radius:36px 36px 12px 12px;background:{PAL["terracotta"]}"></div></div>
    <div style="font-size:14px;opacity:0.78;line-height:1.5">Gingham and stripes as bands and grounds. Arches, stickers and photos with tape as collage touches. Illustration is flat cut-paper with personality: characters allowed, native flora encouraged. Monoline doodles stay as the quiet option.</div>
  </div>
</div>
<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:20px">
  <div style="display:flex;flex-direction:column;gap:10px;padding:20px;background:#FFFFFF;border-radius:16px">
    <div style="font-family:{DISPLAY};font-size:22px">Illustration sets, first pass</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">{sun(56)}{wave(56)}{ring(56)}{cake(56)}{sausage(56)}{balloon(56)}{waratah(56)}{wattle(56)}{glasses(56)}{disco(56)}{gift(56)}{kids(56)}{car(56)}{gate(56)}{towel(56)}{camera(56)}{bubble(56)}</div>
    <div style="font-size:14px;opacity:0.78;line-height:1.5">Summer (pool, sun, waves), Native garden (waratah, wattle, banksia), Birthday (cake, glasses, disco ball), Baby (pram, bunting), Home and family (house, plants, dog), Quiet (candle, gum leaf, monoline). Each set has its timeline icons, its cover cluster and its stickers.</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px;padding:20px;background:#FFFFFF;border-radius:16px">
    <div style="font-family:{DISPLAY};font-size:22px">What stays from the board's strips</div>
    <div style="font-size:15px;line-height:1.6">Coloured bands break the long scroll into chapters. The RSVP is a full-width block in a strong colour, a moment rather than a form. Stickers carry the date and time on the cover. A tape-and-photo collage becomes the thank-you page and the host's own artwork in upload mode.</div>
    <div style="font-size:14px;opacity:0.78;line-height:1.5">Two dressed strips sit to the right: Leo's pool party in the Summer set, and Marcia's birthday drinks in the Native garden set.</div>
  </div>
</div>
'''
open("BoardDecisions.dc.html","w").write(f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{FONTS}">
  <style>
    body {{ margin: 0; background: {PAL["cream"]}; }}
    a {{ color: {PAL["cobalt"]}; }} a:hover {{ opacity: 0.85; }}
  </style>
</helmet>
<div style="width:1180px;min-height:980px;background:{PAL["cream"]};font-family:{BODY};color:{PAL["ink"]};display:flex;flex-direction:column;gap:22px;padding:36px 40px;box-sizing:border-box">
{decisions}
</div>
</x-dc>
</body>
</html>''')

c = json.load(open("canvas.json"))
c["artboards"] = [a for a in c["artboards"] if a.get("page") != "page-4"]
c["annotations"] = [n for n in c["annotations"] if n.get("page") != "page-4"]
c["pages"] = [p for p in c["pages"] if p["id"] != "page-4"] + [{"id": "page-4", "name": "From the board"}]
c["artboards"] += [
  {"file": "BoardDecisions.dc.html", "x": 0, "y": 0, "w": 1180, "h": 980, "title": "Decisions read from the board", "page": "page-4"},
  {"file": "BoardPoolParty.dc.html", "x": 1280, "y": 0, "w": 390, "h": 2140, "title": "Leo's pool party, Summer set", "page": "page-4"},
  {"file": "BoardBirthdayDrinks.dc.html", "x": 1760, "y": 0, "w": 390, "h": 1720, "title": "Birthday drinks, Native garden set", "page": "page-4"},
]
c["launch"] = {"view": "canvas", "page": "page-4"}
json.dump(c, open("canvas.json", "w"), indent=2)
print("ok", len(c["artboards"]))
