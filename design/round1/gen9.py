# A live prototype: Gabriel's invite opening like a Paperless Post envelope. Standalone HTML artifact.
src = open("gen8.py").read()
exec(src.split("\nsuite = ")[0])

cards = "\n".join([main_card(), details_card(), day_card(), know_card(), reply_card(), after_card()])
liner = gingham(SKY)

html = f'''<title>Gabriel Turns Four</title>
<link rel="stylesheet" href="{FONTS}">
<style>
  :root {{ --sky:{SKY}; --navy:{NAVY}; --yel:{YEL}; --crm:{CRM}; --red:{RED}; --red-dark:#B5301C; --paper:{PAPER}; }}
  html, body {{ margin:0; }}
  body {{ background:var(--sky); background-image:radial-gradient({NAVY}33 1.6px, transparent 1.7px); background-size:14px 14px; color:var(--navy); font-family:{BODY}; padding-inline:16px; padding-block:0 48px; min-height:100%; }}
  a {{ color:var(--sky); }}
  .wrap {{ max-width:390px; margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:34px; }}
  .greet {{ font-family:{HAND}; font-size:15px; letter-spacing:0.14em; text-transform:uppercase; color:var(--crm); margin-top:28px; text-align:center; }}

  /* The stage: the sealed envelope, then the opening. */
  .stage {{ position:relative; width:346px; max-width:100%; height:500px; perspective:1200px; transition:height .7s cubic-bezier(.4,0,.2,1), opacity .5s; }}
  .env {{ position:absolute; left:0; right:0; top:180px; height:200px; transform-style:preserve-3d; }}
  .back, .pocket {{ filter:drop-shadow(0 12px 12px rgba(27,42,74,0.3)); }}
  .back {{ position:absolute; inset:0; background:var(--red); border-radius:10px; }}
  .clip {{ position:absolute; left:-40px; right:-40px; top:-700px; bottom:0; overflow:hidden; z-index:2; }}
  .card-slot {{ position:absolute; left:50%; top:894px; width:330px; margin-left:-165px; transform:scale(.62); transform-origin:top center; transition:transform .8s cubic-bezier(.4,0,.2,1), top .8s cubic-bezier(.4,0,.2,1); }}
  .pocket {{ position:absolute; inset:0; z-index:3; border-radius:0 0 10px 10px; }}
  .pocket .sides {{ position:absolute; inset:0; background:var(--red-dark); border-radius:0 0 10px 10px; clip-path:polygon(0 0,50% 58%,100% 0,100% 100%,0 100%); }}
  .pocket .edge {{ position:absolute; inset:0; background:var(--red); border-radius:0 0 10px 10px; clip-path:polygon(0 0,50% 58%,100% 0,100% 6%,50% 64%,0 6%); opacity:.6; }}
  .addr {{ position:absolute; left:26px; bottom:22px; font-family:{HAND}; font-size:24px; line-height:1.2; color:var(--crm); }}
  .addr span {{ font-size:18px; opacity:.9; }}
  .stamp {{ position:absolute; right:18px; top:22px; width:64px; height:76px; background:#fff; padding:5px; box-sizing:border-box; border-radius:3px; box-shadow:0 1px 3px rgba(0,0,0,.2); }}
  .stamp > div {{ width:100%; height:100%; background:var(--sky); border:2px solid var(--navy); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; color:#fff; font-family:{DISPLAY}; }}
  .flap {{ position:absolute; left:0; right:0; top:0; height:120px; transform-origin:top center; transform-style:preserve-3d; transition:transform .9s cubic-bezier(.4,0,.2,1); z-index:4; }}
  .flap .face {{ position:absolute; inset:0; backface-visibility:hidden; clip-path:polygon(0 0,100% 0,50% 100%); }}
  .flap .front {{ background:var(--red); }}
  .flap .backface {{ {liner} transform:rotateX(180deg); }}
  .flap .rim {{ position:absolute; inset:0; background:var(--red); clip-path:polygon(0 0,100% 0,50% 100%,50% 94%,97% 0,3% 0,50% 94%,50% 100%); }}
  .seal {{ position:absolute; left:50%; top:104px; width:52px; height:52px; margin-left:-26px; border-radius:50%; background:var(--yel); border:3px solid var(--navy); display:flex; align-items:center; justify-content:center; z-index:5; transition:opacity .3s, transform .3s; box-shadow:0 2px 0 rgba(27,42,74,.3); }}
  .hint {{ position:absolute; left:0; right:0; bottom:24px; text-align:center; font-family:{HAND}; font-size:20px; letter-spacing:.08em; color:var(--crm); transition:opacity .3s; }}
  .hint::after {{ content:""; display:block; width:8px; height:8px; border-radius:50%; background:var(--yel); margin:8px auto 0; animation:pulse 1.4s ease-in-out infinite; }}
  @keyframes pulse {{ 0%,100% {{ transform:scale(1); opacity:1 }} 50% {{ transform:scale(1.8); opacity:.5 }} }}
  .tap {{ position:absolute; inset:0; z-index:6; background:transparent; border:0; cursor:pointer; width:100%; height:100%; border-radius:12px; }}
  .tap:focus-visible {{ outline:3px solid var(--yel); outline-offset:4px; }}

  /* Phases */
  .open .flap {{ transform:rotateX(-180deg); z-index:1; }}
  .open .seal, .open .hint {{ opacity:0; transform:scale(.6); pointer-events:none; }}
  .rise .card-slot {{ top:760px; }}
  .out .clip {{ overflow:visible; z-index:7; }}
  .out .card-slot {{ top:700px; transform:scale(1); }}
  .out .back, .out .pocket {{ transform:translateY(120px) scale(.9); opacity:0; }}
  .out .flap {{ opacity:0; }}
  .back, .pocket, .flap {{ transition:transform .8s cubic-bezier(.4,0,.2,1), opacity .5s; }}
  .flap {{ transition:transform .9s cubic-bezier(.4,0,.2,1), opacity .5s; }}
    .done .stage {{ display:none; }}
  .suite {{ display:none; flex-direction:column; align-items:center; gap:34px; width:100%; opacity:0; transition:opacity .5s; }}
  .done .suite {{ display:flex; opacity:1; }}
  .foot {{ font-size:13px; color:var(--crm); }}
  @media (prefers-reduced-motion: reduce) {{ .stage, .env, .back, .pocket, .card-slot, .flap, .suite {{ transition:none !important; }} .hint::after {{ animation:none; }} }}
</style>

<div class="wrap" id="wrap">
  <div class="greet">Hi Mia, something for you</div>

  <div class="stage" id="stage">
    <div class="env">
      <div class="back"></div>
      <div class="clip"><div class="card-slot" id="cardslot">{main_card()}</div></div>
      <div class="pocket"><div class="sides"></div><div class="edge"></div>
        <div class="addr">Mia<br><span>plus family</span></div>
        <div class="stamp"><div><svg width="26" height="30" viewBox="0 0 26 30"><path d="M14 1L2 17h9l-4 12 17-18h-9l5-10z" fill="{YEL}" stroke="{NAVY}" stroke-width="2" stroke-linejoin="round"/></svg><div style="font-size:22px;line-height:1">4</div></div></div>
      </div>
      <div class="flap"><div class="face front"></div><div class="face backface"></div><div class="rim"></div></div>
      <div class="seal">{bolt(30)}</div>
    </div>
    <div class="hint">Tap to open</div>
    <button class="tap" id="tap" aria-label="Open the invitation"></button>
  </div>

  <div class="suite" id="suite">
    {cards}
    <div class="foot">Questions? Text Gabriel's mum</div>
  </div>
</div>

<script>
(function () {{
  var wrap = document.getElementById('wrap'), stage = document.getElementById('stage'), tap = document.getElementById('tap');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var opened = false, timer;
  function step(cls, ms, next) {{ wrap.classList.add(cls); if (next) setTimeout(next, reduce ? 0 : ms); }}
  function open() {{
    if (opened) return; opened = true; clearTimeout(timer); tap.disabled = true;
    step('open', 700, function () {{
      step('rise', 750, function () {{
        step('out', 800, function () {{
          step('done', 0);
          window.scrollTo({{ top: 0, behavior: 'auto' }});
        }});
      }});
    }});
  }}
  tap.addEventListener('click', open);
  timer = setTimeout(open, 2600);
}})();
</script>
'''
open("prototypes/envelope-opening.html", "w").write(html)
print("prototype written", len(html))
