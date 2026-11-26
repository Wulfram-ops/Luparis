#!/usr/bin/env python3
"""End-to-end smoke tests of the site in a real browser (Playwright).

    python3 tests/smoke.py              # uses a system Chrome if found, else Playwright's Chromium
    python3 tests/smoke.py --chrome /usr/bin/google-chrome

Starts its own local server on a free port. Each check prints OK or FAIL; the exit code is the
number of failures. The app's scope is reached through window.DBG, enabled by ?debug=1.
"""
from __future__ import annotations

import argparse
import base64
import functools
import http.server
import io
import json
import shutil
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
FAILS: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    print(("OK   " if ok else "FAIL ") + name + (f" — {detail}" if detail and not ok else ""))
    if not ok:
        FAILS.append(name)


def serve() -> tuple[http.server.ThreadingHTTPServer, str]:
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):  # keep the test output readable
            pass

    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/index.html"


def png(data_url: str):
    from PIL import Image

    return Image.open(io.BytesIO(base64.b64decode(data_url.split(",", 1)[1]))).convert("RGB")


def run(chrome: str | None) -> None:
    srv, url = serve()
    with sync_playwright() as p:
        browser = p.chromium.launch(**({"executable_path": chrome} if chrome else {}))
        ctx = browser.new_context(viewport={"width": 1400, "height": 900}, accept_downloads=True, reduced_motion="reduce")
        page = ctx.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(url + "?debug=1")
        page.wait_for_timeout(1200)
        D = lambda js: page.evaluate("x => DBG(x)", js)  # noqa: E731

        # every tab opens without a script error
        for tab in ("monde", "fiche", "bestiaire", "regles", "carte"):
            page.click(f'.tabs a[data-v="{tab}"]')
            page.wait_for_timeout(700 if tab != "monde" else 1500)
        check("tabs open without errors", not errors, "; ".join(errors[:3]))
        check("bestiary rendered on open", page.locator("#bt tr").count() > 100)
        page.click('.tabs a[data-v="regles"]')
        page.wait_for_timeout(500)
        check("rules loaded on demand", page.locator("#rbody h2").count() >= 10)
        page.click('.tabs a[data-v="carte"]')
        page.wait_for_timeout(300)

        # map: generate, paint, and compare the cached scene with a full redraw
        D("document.getElementById('gen').click()")
        page.wait_for_timeout(500)
        D("CAM.z=2;camSet();drawNow();hover=null")
        D("""(()=>{for(const[x,y,v]of[[5,5,3],[6,5,-2],[7,7,2]]){H[x][y]=v;if(v<0)F[x][y]=0;drawDirty({x,y})}})()""")
        page.wait_for_timeout(200)
        a = png(D("hover=null;drawLiteNow();cv.toDataURL()"))
        b = png(D("hover=null;drawNow();cv.toDataURL()"))
        from PIL import ImageChops

        # anti-aliasing at the clip edge may differ by a few levels; anything visible would exceed 16
        visible = sum(ImageChops.difference(a, b).convert("L").histogram()[17:])
        diff = None if visible == 0 else f"{visible} visibly different pixels"
        check("partial redraw matches a full redraw", diff is None, str(diff))
        if diff:
            a.save("/tmp/smoke-partial.png")
            b.save("/tmp/smoke-full.png")
        page.wait_for_timeout(400)
        stored = page.evaluate("JSON.parse(localStorage.getItem('luparis-tac')).H")
        check("map saved after the edit", isinstance(stored, list) and len(stored) > 0)

        # search
        page.keyboard.press("Control+k")
        page.fill("#us_q", "goblin")
        page.wait_for_timeout(200)
        first = page.locator("#us_res li").first.inner_text()
        check("universal search finds a monster", "Goblin" in first, first)
        page.keyboard.press("Escape")
        page.keyboard.press("Escape")

        # monster sheet: Luparis version of an SRD creature
        page.evaluate("DBG(\"monSheet(SRD.find(x=>x.id==='s-adult-red-dragon'))\")")
        page.wait_for_timeout(900)
        sheet = page.locator("#sbdlg .ms").inner_text()
        check("monster sheet in Luparis terms", "Tier 5" in sheet and ("tiles" in sheet or "cases" in sheet), sheet[:80])
        check("dragons are chaotic neutral", "chaotic neutral" in sheet or "chaotique neutre" in sheet)
        page.evaluate("document.getElementById('sbdlg').close()")

        D("monSheet(MON.find(x => x.id === 'd39'))")  # starter alias of the lich
        page.locator("#sbdlg .msmagic").first.wait_for()
        school = page.locator("#sbdlg .msmagic").filter(has=page.locator('[data-school="afflux"]'))
        school.locator("summary").click()
        check("school repertoire prices fireball in Mana", "3 Mana" in school.inner_text())
        school.locator('[data-mode="dmg"]').click()
        check("school damage rolls use d8", D("RL[0].h.includes('d8')"))
        check("token and sheet use the same lich attack", D("SBA[0].dd===8 && SBA[0].ab===monAtk(SBM)[0].ab"))
        D("monSheet(MON.find(x => x.id === 's-flying-snake'))")
        check("fixed bite and poison use one damage roll", "3d4" in page.locator('#sbdlg [data-sbr="dmg"]').first.inner_text())
        check("starter vampire resolves to its published form", D("srdKey(MON.find(x=>x.id==='d36'))==='s-vampire-vampire'"))
        page.evaluate("document.getElementById('sbdlg').close()")

        # backup round trip
        page.click("#bk_open")
        with page.expect_download() as dl:
            page.click("#bk_exp")
        backup = json.loads(Path(dl.value.path()).read_text(encoding="utf-8"))
        check("backup holds the map", "luparis-tac" in backup.get("data", {}))
        page.keyboard.press("Escape")

        # big messages (large maps) travel in pieces and come back whole
        check(
            "large multiplayer messages are cut and rebuilt",
            D("(()=>{const o={type:'state',x:'a'.repeat(200000)},P=mpPieces(o),st={};let r=null;for(const p of P.reverse())r=mpJoinPiece(st,p)||r;return P.length>3&&r&&r.x.length===200000})()"),
        )

        # Restored square geometry and migration of hex-era saves.
        check("isometric view by default, with 2:1 diamonds", D("""(() => {
            const [t, r, b, l] = tileCorners(0, 0, 0);
            return PROJ === 'iso' && Math.abs((r[0] - l[0]) - 2 * (b[1] - t[1])) < 1e-6;
        })()"""))
        check("picking in isometric view", D("""(() => {const oldH=H;try{H=blank(N);for(let x=0;x<N;x+=3)for(let y=0;y<N;y+=3){const [vx,vy]=view(x,y),[cx,cy]=scr(vx+.5,vy+.5,0),c=pick(cx,cy);if(!c||c.x!==x||c.y!==y)return false}return true}finally{H=oldH}})()"""))
        D("PROJ='top';layout()")
        check("camera projects a square board aligned with the screen", D("""(() => {
            const [topLeft, topRight] = tileCorners(0, 0, 0),
                [, , bottomRight, bottomLeft] = tileCorners(N - 1, N - 1, 0),
                [right] = scr(N, 0, 0), [left, top] = topLeft;
            return Math.abs(right - left - (bottomRight[1] - top)) < 1e-6 &&
                topRight[1] === top && bottomLeft[1] === bottomRight[1] &&
                Math.abs(bottomRight[0] - right) < 1e-6;
        })()"""))
        check("picking follows the tops and faces of elevated tiles after rotation", D("""(() => {
            const oldH = H, oldRot = rot;
            try {
                for (rot = 0; rot < 4; rot++) {
                    H = blank(N);
                    const [x, y] = unview(2, 2), [px, py] = unview(3, 2);
                    H[x][y] = MAX_ELEVATION;
                    H[px][py] = -2;
                    const hits = (screen, tx, ty) => {
                        const hit = pick(...screen);
                        return hit?.x === tx && hit?.y === ty;
                    };
                    if (!hits(scr(2.5, 2.5, MAX_ELEVATION), x, y) ||
                        !hits(scr(2.5, 2.9, 0), x, y) ||
                        !hits(scr(3.5, 2.5, 0), px, py) || pick(...scr(-0.5, 2.5, 0))) return false;
                }
                return true;
            } finally { H = oldH; rot = oldRot; }
        })()"""))
        D("PROJ='iso';layout()")
        check("square radius two has 13 cells", D("tplCells({k:'circle',x:5,y:5,s:10,a:0}).length===13"))
        check("four rotations round trip", D("(()=>{const old=rot;try{for(rot=0;rot<4;rot++){const p=unview(...view(3,5));if(p[0]!==3||p[1]!==5)return false;}return true;}finally{rot=old}})()"))
        check("hex-era saves retain cells and entities", D("""(()=>{const original=JSON.parse(JSON.stringify(memStateNow()));try{for(const grid of ['hex','hex-offset']){const d={...original,grid,rot:5};if(!applyState(d))return false;const s=memStateNow();if(s.grid!=='square'||rot<0||rot>3)return false;for(const k of ['N','H','F','tokens','marks','objs','env','ini'])if(JSON.stringify(s[k])!==JSON.stringify(original[k]))return false;}return true;}finally{applyState(original);layout();}})()"""))
        # The default layout keeps the map and sheet together on different screen sizes.
        page.click('.tabs a[data-v="carte"]')
        D("fitMap()")
        for width, height in ((1400, 900), (1280, 720), (2560, 1080), (800, 900)):
            page.set_viewport_size({"width": width, "height": height})
            page.wait_for_timeout(150)
            m, h = page.locator("#stage").bounding_box(), page.locator('[data-gk="hero"]').bounding_box()
            check(f"map and sheet visible {width}x{height}", bool(m and h and m["width"]>0 and h["width"]>0))
            check(f"responsive workspace {width}x{height}", bool(m and h and (m["x"]+m["width"]<=h["x"]+1 if width>900 else m["y"]+m["height"]<=h["y"]+1)))
            check("board corners visible", D("""[[0,0],[0,N-1],[N-1,0],[N-1,N-1]].flatMap(p=>tileCorners(...view(...p),0)).every(([x,y])=>x>=0&&x<=W&&y>=0&&y<=Hc)"""))
        page.set_viewport_size({"width":1400,"height":900})
        check("map quality selector removed", page.locator("#perfq").count() == 0)
        check("map zoom and display buttons removed", page.locator("#zin,#zout,#zfit,#play_display_label").count()==0)
        page.keyboard.press("x")
        check("map zoom is available from the keyboard", D("CAM.z > 1"))
        page.keyboard.press("c")
        check("fit restores the full map", D("CAM.z === 1"))
        check("the character preset is gone", page.locator('[data-play-preset="sheet"]').count() == 0)
        for preset in ("table", "combat", "explore", "prepare"):
            D(f"playUsePreset('{preset}', true)")
            page.wait_for_timeout(150)
            check(f"{preset}: no module needs scrolling", D("[...document.querySelectorAll('#play_workspace [data-gk]')].every(e=>e.hidden||e.dataset.gk==='map'||e.scrollHeight<=e.clientHeight+1)"))
            check(f"{preset}: modules never overlap", D("(()=>{const k=Object.keys(GL).filter(gShown);return k.every(a=>k.every(b=>a===b||!gHit(GL[a],GL[b])))})()"))
        D("playUsePreset('table')")
        page.locator('[data-play-preset="combat"]').click()
        ini, m = page.locator('[data-gk="in"]').bounding_box(), page.locator("#stage").bounding_box()
        check("combat keeps the turn order above the map", ini["y"] + ini["height"] <= m["y"] + 1 and page.locator("#in_round").is_visible())
        page.locator('[data-play-preset="explore"]').click()
        check("exploration shows markers beside a large map", page.locator("#mk_card").is_visible() and not page.locator('[data-gk="in"]').is_visible())
        # a module moves by its title; the others make room; the layout is kept per preset
        before = D("JSON.stringify(GL.mk)")
        t = page.locator('[data-gk="mk"] h3').first.bounding_box()
        page.mouse.move(t["x"] + 20, t["y"] + 5)
        page.mouse.down()
        page.mouse.move(t["x"] + 20, t["y"] + 85, steps=6)
        check("dragging previews the move", D("JSON.stringify(GL.mk)") != before)
        page.keyboard.press("Escape")
        check("Esc cancels the move", D("JSON.stringify(GL.mk)") == before)
        page.mouse.up()
        page.mouse.move(t["x"] + 20, t["y"] + 5)
        page.mouse.down()
        page.mouse.move(t["x"] + 20, t["y"] + 85, steps=6)
        page.mouse.up()
        moved = D("JSON.stringify(GL.mk)")
        check("a module moves by its title", moved != before and D("[...document.querySelectorAll('#play_workspace [data-gk]')].every(e=>e.hidden||e.dataset.gk==='map'||e.scrollHeight<=e.clientHeight+1)"))
        page.locator("#play_customize").click()
        page.locator('[data-gmod="img"]').uncheck()
        page.locator("#play_layout_dialog button[type=submit]").click()
        page.reload()
        page.wait_for_function("typeof DBG==='function' && DBG('W>0')")
        check("layout and hidden modules persist by preset", page.locator('[data-play-preset="explore"]').get_attribute("aria-pressed") == "true"
            and D("JSON.stringify(GL.mk)") == moved and not page.locator("#img_card").is_visible())
        page.locator("#play_customize").click()
        page.locator("#play_restore").click()
        page.locator("#play_layout_dialog button.go").click()
        check("reset restores the exploration default", page.locator("#img_card").is_visible() and D("JSON.stringify(GL.mk)") != moved)
        page.set_viewport_size({"width":390,"height":844})
        page.locator("#play_preset_select").select_option("combat")
        check("mobile preset selector keeps access to the sheet and map", page.locator("#stage").is_visible() and page.locator('[data-gk="hero"]').is_visible())
        page.set_viewport_size({"width":1400,"height":900})
        page.locator('[data-play-preset="prepare"]').click()
        check("preparation exposes the generator and templates in the edit toolbar",
              page.locator("#v-carte > .bar #map_ai_open").is_visible() and page.locator("#map_templates_open").is_visible())
        check("preparation selects the asset mover", D("tool === 'shift'"))
        before = D("mgSnapshot()")
        canvas = page.locator("#cv").bounding_box()
        x = canvas["x"] + canvas["width"] / 2
        y = canvas["y"] + canvas["height"] / 3
        page.mouse.move(x, y)
        page.mouse.down(button="right")
        page.mouse.move(x + 45, y + 25, steps=4)
        page.mouse.up(button="right")
        check("right-drag in edit pans without editing the board",
              D("CAM.px === 45 && CAM.py === 25 && pan === null") and D("mgSnapshot()") == before)
        D("fitMap()")
        page.locator("#map_templates_open").click()
        check("the map library opens from the toolbar", page.locator("#map_templates_dialog[open] #map_preset_canvas").is_visible())
        for kind in ("bridge", "tavern", "vaults", "shrine", "market", "ambush"):
            page.locator(f'[data-map-preset="{kind}"]').click()
            check(f"{kind} template previews without changing the board", page.locator("#map_preset_canvas").is_visible() and D("mgSnapshot()") == before)
        page.locator('[data-map-preset="bridge"]').click()
        page.locator("#map_preset_size").select_option("large")
        page.locator("#map_preset_variant").click()
        preview = D("mapPresetCandidate.state")
        page.locator("#map_preset_apply").click()
        check("map template applies the exact preview at the selected size", D("N===32") and D("mgSnapshot()") == preview)
        page.locator("#undo").click()
        check("map template replacement can be undone", D("mgSnapshot()") == before)
        page.locator("#map_ai_open").click()
        page.locator("#mg_engine").select_option("local")
        page.locator("#mg_q").fill("ruined temple in a forest")
        page.locator('#mg_f button[type="submit"]').click()
        check("the edit toolbar generator shows a preview without editing", page.locator("#mg_thumb").is_visible() and D("mgSnapshot()") == before)
        page.locator("#mg_apply").click()
        check("the generator applies the map and returns to the board", not page.locator("#map_ai_dialog").is_visible() and D("bio === 'foret'"))
        page.locator("#undo").click()
        page.locator('[data-play-preset="table"]').click()
        check("leaving preparation restores play mode", D("document.body.classList.contains('mode-play')"))
        check("AI generation is specific to edit mode", not page.locator("#map_ai_open").is_visible())
        D("handChar().sch[Object.keys(SCH)[0]]=1;renderHand()")
        for target in ("[data-ha=atk]", "[data-pfr]", ".k-spl", ".k-inv", "[data-hnotes]"):
            check(f"character module {target} shown", page.locator(f'#play_workspace {target}').first.is_visible())
        page.locator('[data-ha="atk"]').first.click()
        check("weapon attack reaches the roll log from the play sheet", D("RL[0].h.includes('d20')"))
        check("roll log floats outside the play workspace", D("$('rolls').parentNode === document.body && getComputedStyle($('rolls')).position === 'fixed'"))
        if page.locator("#rl_tog").get_attribute("aria-expanded") == "true":
            page.locator("#rl_tog").click()
        page.locator('[data-ht="hp"][data-d="1"]').click()
        check("play sheet updates vitality", D("handChar().used.hp === 1"))
        page.locator('[data-hrest="long"]').click()
        check("long rest restores resources from the play sheet", D("Object.values(handChar().used).every(n => n === 0)"))
        for target in ("#in_round", "#mk_card", "#sn_box", "#img_box"):
            check(f"table module {target} shown", page.locator(target).is_visible())
        page.keyboard.press("6")
        page.locator("#v-multijoueur").wait_for(state="visible")
        check("multiplayer has its own tab", page.locator("#mp_host").is_visible() and not page.locator("#play_workspace").is_visible())
        page.locator("#rl_tog").click()
        check("floating rolls can open outside the Play tab", page.locator("#rl_list").is_visible() and page.locator("#rl_list li.new").count() == 1)
        page.locator("#rl_tog").click()
        page.click('.tabs a[data-v="carte"]')
        page.locator('#langs button[data-lang="fr"]').click()
        check("French workspace labels", page.locator("#play_customize").inner_text()=="Personnaliser" and page.locator('[data-play-preset="prepare"]').inner_text()=="Préparation")
        page.locator('#langs button[data-lang="en"]').click()
        check("English workspace labels", page.locator("#play_customize").inner_text()=="Customize")
        # Quick placement belongs to the map toolbar, not the draggable layout.
        page.click('.tabs a[data-v="carte"]')
        check("quick place opens from the GM toolbar", not page.locator("#pl_bar").is_visible())
        page.locator("#pl_toggle").click()
        check("quick place is in GM toolbar", page.locator("#v-carte > .bar #pl_bar").is_visible())
        check("quick placement not duplicated", page.locator("#pl_bar").count()==1)
        page.fill("#pl_q", "dragon")
        check("toolbar quick place search still works", page.locator("#pl_res button[data-pm]").count() > 0)
        page.locator("#pl_res button[data-pm]").first.click()
        check("toolbar quick place selects a monster", D("tool==='place' && !!placing && !placing.ally"))
        page.keyboard.press("Escape")
        # right-click menus and campaign deletion (characters are kept)
        page.evaluate("DBG(`CH.list.push({...blankC(),id:'z1',name:'Zed',camp:'Temp'});saveC();deleteCampaign('Temp')`)")
        check(
            "deleting a campaign keeps its characters",
            D("CH.list.some(c=>c.id==='z1'&&!c.camp) && !campaignFolders().includes('Temp')"),
        )
        page.click('.tabs a[data-v="fiche"]')
        card = page.locator("#v-fiche .cc").first
        card.scroll_into_view_if_needed()
        page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
        card.click(button="right")
        check("character context menu opens", page.locator(".ctxm").is_visible())
        page.keyboard.press("Escape")
        page.click('.tabs a[data-v="carte"]')

        # AI recipes are validated and custom rooms retain their individual dimensions.
        check("AI rejects empty recipes", D("(()=>{try{mgRecipe('{}');return false}catch(e){return true}})()"))
        check("AI sanitizes unknown values", D("mgClean({bio:'constructor',size:'toString',objs:[{k:'unknown'}]}).bio===null && mgClean({size:'toString'}).size===null"))
        check("custom rooms and targeted objects survive normalization", D("""(()=>{const r=mgClean({add:[{k:'room',w:7,h:9,pos:'north',entrance:'east'},{k:'room',w:8,h:5,pos:'south'}],objs:[{k:'chest',place:2,hidden:true}]});return r.add.length===2&&r.add[0].h===9&&r.objs[0].place===2&&r.objs[0].hidden})()"""))
        check("generated map undo restores size and terrain", D("""(()=>{const before=JSON.stringify([N,H,F,bio]);mgBuild(mgClean({bio:'donjon',size:'small',add:[{k:'room',w:7,h:7,entrance:'east'}]}),42);const drawn=OBJS.some(o=>o.k==='door');$('undo').click();return drawn&&JSON.stringify([N,H,F,bio])===before})()"""))
        check("AI links are validated and deduplicated", D("""(()=>{const r=mgClean({add:['room','room'],links:[{from:1,to:2,width:2},{from:2,to:1},{from:1,to:6}]});return r.links.length===1&&r.links[0].width===2})()"""))
        check("preview builds linked rooms without changing map or history", D("""(()=>{const before=mgSnapshot(),h=hist.length;const c=mgBuild({bio:'donjon',size:'large',add:[{k:'room',pos:'north',entrance:'south'},{k:'room',pos:'south',entrance:'north'}],links:[{from:1,to:2,width:2}]},17,true);const d=JSON.parse(c.state);return d.objs.filter(o=>o.k==='door').length===2&&MG.access.size>8&&mgSnapshot()===before&&hist.length===h&&c.issues.length===0})()"""))
        check("local campfire does not create a fire hazard", D("mgParse('camp avec un feu de camp').env.every(e=>e.k!=='fire')"))
        check("local explicit water exclusion", D("mgParse('forêt sans rivière').terrain.water==='none'"))
        # a sentence becomes a map (keywords, no AI key)
        r = D("JSON.stringify(mgParse('Temple en ruines dans la forêt, trois statues'))")
        page.evaluate("DBG(`mgBuild(mgParse('temple en ruines dans la forêt'))`)")
        check(
            "a sentence draws a map",
            '"bio":"foret"' in r and '"temple"' in r and '"n":3' in r and D("OBJS.some(o=>o.k==='altar') && bio==='foret'"),
            r,
        )

        # Weapon passives: exact hit margins, misses, mastery requirement and armor floor.
        check("weak point triggers at margin five", D("weaponOutcome('estoc',1,13,18,13,null).weak") is True)
        check("weak point does not trigger at margin four", D("weaponOutcome('estoc',1,13,17,13,null).weak") is False)
        check("sweep requires both targets to be hit", D("weaponOutcome('taille',1,14,17,15,17).sweep && !weaponOutcome('taille',1,14,17,15,18).sweep"))
        check("sweep needs mastery and a primary hit", D("!weaponOutcome('taille',0,14,17,15,17).sweep && !weaponOutcome('taille',1,14,17,18,15).sweep"))
        check("natural one never triggers passives", D("!weaponOutcome('estoc',1,1,25,13,null).weak && !weaponOutcome('taille',1,1,25,13,13).sweep"))
        check("armor break respects armor floor", D("weaponArmorReduction(0)===0 && weaponArmorReduction(1)===1 && weaponArmorReduction(6)===2"))
        check("sweep damage is rolled once and limited per turn", D("""(()=>{
            const c=blankC();c.id='sweep-test';c.fam.taille=1;c.weapons=[{n:'Sword',f:'taille',s:'one'}];
            const k=weaponKey(c,0), original=Math.random;
            try { Math.random=()=>0.99;weaponInput(c,0).second=10;
              weaponAttack(c,0,10);const first=weaponDamage(c,0);
              weaponAttack(c,0,10);const second=weaponDamage(c,0);
              return first.includes(tr(WP.taille)) && first.includes('<b>6</b>') && !second.includes(tr(WP.taille));
            } finally { Math.random=original;sweepUsed.delete(c.id);weaponInputs.delete(k);weaponStrikes.delete(k); }
        })()"""))
        # multiplayer (same browser): a player's roll reaches the GM cleaned of any script
        host = ctx.new_page()
        host.goto(url + "?debug=1&local=1")
        host.wait_for_timeout(800)
        host.click('.tabs a[data-v="multijoueur"]')
        host.locator("#mp_host").click()
        host.wait_for_timeout(400)
        code = host.evaluate("DBG('MP.code')")
        host.evaluate("DBG(`{const c=blankC();c.id='xp-test';c.name='XP Test';c.xp=150;CH.list.push(c);saveC()}`)")
        host.evaluate(
            "DBG(`tokens.push({id:'f1',x:1,y:1,t:'foe',n:'G1',nm:'Gob',esq:12,maj:8,sev:16,hp:2,hpMax:4,mid:'x',no:'secret'},"
            "{id:'h1',x:3,y:3,t:'foe',n:'H'}); tokens[tokens.length-1].hid=1; MP.secret=true; pushRoll('<b>7</b>','GM'); MP.secret=false`)"
        )
        player = ctx.new_page()
        player.goto(url + "?debug=1&local=1")
        player.wait_for_timeout(800)
        player.evaluate(f"DBG(\"mpJoin('{code}',{{me:'xp-test'}})\")")
        player.wait_for_timeout(1000)
        check("player joins the game", player.evaluate("DBG('MP.got')") is True)
        seen = player.evaluate("DBG('JSON.stringify(tokens.filter(k=>k.t===\\'foe\\'))')")
        check(
            "players see no hidden token nor monster numbers",
            '"f1"' in seen and '"h1"' not in seen and "hpMax" not in seen and "secret" not in seen and '"st":"b"' in seen,
            seen,
        )
        check("secret GM rolls stay secret", player.evaluate("DBG('RL.some(r=>r.s===\\'GM\\')')") is False)
        player.click('.tabs a[data-v="fiche"]')
        player.locator('[data-open="xp-test"]').click()
        check("player cannot award own XP", player.locator("#c_xp").get_attribute("readonly") is not None)
        player.locator('[data-stat="P"][data-d="1"]').click()
        host.wait_for_timeout(600)
        check("player XP purchase reaches GM", host.evaluate("DBG(\"CH.list.find(c=>c.id==='xp-test').st.P\")") == 1)
        check("XP purchase recalculates cells", host.evaluate("DBG(\"CH.list.find(c=>c.id==='xp-test').cells.P_phy\")") == 1)
        check("XP purchase survives host sync", player.evaluate("DBG(\"spent(CH.list.find(c=>c.id==='xp-test'))\")") == 20)
        player.evaluate("DBG(`{const c=CH.list.find(c=>c.id==='xp-test');mpSend({type:'char',c:{...c,xp:999999,dv:12}})}`)")
        host.wait_for_timeout(600)
        check("host rejects over-budget upgrades and forged XP", host.evaluate("DBG(\"{const c=CH.list.find(c=>c.id==='xp-test');c.xp===150&&c.dv===6&&c.st.P===1}\")"))
        player.evaluate("DBG(`{const c=CH.list.find(c=>c.id==='xp-test');mpSend({type:'char',c:{...c,xp:999999}})}`)")
        host.wait_for_timeout(600)
        check("host ignores forged XP even with valid allocation", host.evaluate("DBG(\"CH.list.find(c=>c.id==='xp-test').xp\")") == 150)
        player.click('.tabs a[data-v="carte"]')
        player.locator("#v-carte").wait_for(state="visible")
        check("quick place toolbar hidden for players", not player.locator("#pl_bar").is_visible())
        check("GM notes not accessible to players", not player.locator("#sn_card").is_visible())
        check("player has integrated sheet", player.locator('[data-gk="hero"]').is_visible())
        check("player sees their own character and combat preset", player.locator('[data-gk="hero"] h3').first.inner_text() == "XP Test" and player.locator('[data-play-preset="combat"]').is_visible())
        check("player cannot access preparation or map templates", not player.locator('[data-play-preset="prepare"]').is_visible() and not player.locator("#map_templates_open").is_visible())
        player.click('.tabs a[data-v="multijoueur"]')
        player.locator("#v-multijoueur").wait_for(state="visible")
        check("player session controls accessible", player.locator("#mp_box").is_visible())
        # Campaign folders exist even when empty and are shared with players.
        host.click('.tabs a[data-v="fiche"]')
        host.evaluate("DBG('CH.active=null;renderSheet()')")
        host.fill("#c_folder_name", "Northern Expedition")
        host.locator("#c_folder_form button[type=submit]").click()
        folder = host.locator('details[data-campfolder="Northern Expedition"]')
        check("empty campaign folder created", folder.count() == 1 and folder.locator(".cc").count() == 0)
        folder.locator("summary").click()
        host.evaluate("DBG('renderList()')")
        check("folder stays collapsed after render", folder.get_attribute("open") is None)
        host.wait_for_timeout(600)
        check("folder is persisted and synchronized", host.evaluate("JSON.parse(localStorage.getItem('luparis-chars')).folders.includes('Northern Expedition')") and player.evaluate("DBG(\"campaignFolders().includes('Northern Expedition')\")"))
        # A new player creates a sheet in the actual UI without an existing claim.
        creator = ctx.new_page()
        creator.goto(url + f"?debug=1&local=1&join={code}#carte")
        creator.wait_for_function("typeof DBG === 'function' && DBG('MP.got')")
        check("a fresh invitation opens the multiplayer tab", creator.locator("#mp_me").is_visible())
        creator.click('.tabs a[data-v="fiche"]')
        creator.fill("#c_nn", "New Adventurer")
        creator.fill("#c_nc", "Northern Expedition")
        creator.locator("#c_nf button[type=submit]").click()
        creator.wait_for_function("DBG(\"!!MP.me && CH.active===MP.me && !!C && C.name==='New Adventurer'\")")
        created_id = creator.evaluate("DBG('MP.me')")
        check("player creation is registered and automatically claimed", host.evaluate("id => DBG('CH.list.some(c=>c.id===' + JSON.stringify(id) + ')')", created_id))
        creator.fill("#c_name", "Renamed Adventurer")
        creator.fill("#c_people", "Elf")
        creator.locator('[data-stat="P"][data-d="1"]').click()
        creator.wait_for_timeout(800)
        check("new character survives sync and edits", creator.evaluate("DBG(\"C.id===MP.me && C.name==='Renamed Adventurer' && C.people==='Elf' && C.st.P===1\")"))
        check("new character is saved on GM browser", host.evaluate("id => JSON.parse(localStorage.getItem('luparis-chars')).list.some(c=>c.id===id&&c.name==='Renamed Adventurer'&&c.st.P===1)", created_id))
        creator.reload()
        creator.wait_for_function("id => DBG('MP.got && MP.me===' + JSON.stringify(id) + ' && CH.list.some(c=>c.id===MP.me)')", arg=created_id)
        check("created character survives player reload", creator.evaluate("DBG(\"CH.list.find(c=>c.id===MP.me).name\")") == "Renamed Adventurer")
        host.evaluate("DBG('CH.active=null;renderSheet()')")
        folder = host.locator('details[data-campfolder="Northern Expedition"]')
        if folder.get_attribute("open") is None:
            folder.locator("summary").click()
        move = folder.locator(f'[data-campmove="{created_id}"]')
        move.select_option("")
        host.wait_for_timeout(600)
        check("GM moves character without deleting empty folder", host.locator('details[data-campfolder="Northern Expedition"] .cc').count() == 0 and host.locator(f'details[data-campfolder=""] [data-campmove="{created_id}"]').count() == 1)
        check("campaign move reaches player and preserves XP", creator.evaluate("DBG(\"CH.list.find(c=>c.id===MP.me).camp===''&&CH.list.find(c=>c.id===MP.me).xp===150\")"))
        mid = host.evaluate("DBG('MON[0].id')")
        host.evaluate(f"DBG(`revToggle('{mid}');mpPush()`)")
        creator.wait_for_timeout(700)
        check(
            "players see only the creatures the GM shows",
            creator.evaluate("DBG('PBEST.length')") == 1 and creator.evaluate("DBG('PBEST.every(m=>m.no==null)')"),
        )
        host.evaluate(f"DBG(`revToggle('{mid}')`)")
        creator.click('.tabs a[data-v="multijoueur"]')
        creator.locator("#mp_place").click()
        creator.locator("#stage").wait_for(state="visible")
        check("placing a token from Multiplayer returns to the map", creator.evaluate("DBG(\"tool === 'place' && placing.ally === MP.me\")"))
        creator.evaluate("DBG('apply({x:2,y:2})')")
        host.wait_for_timeout(600)
        check(
            "a player places their own token",
            host.evaluate("id => DBG('tokens.some(k=>k.cid===' + JSON.stringify(id) + '&&k.x===2&&k.y===2)')", created_id),
        )
        host.evaluate("DBG(`OBJS.push({x:6,y:6,k:'door',o:false,r:0});save();mpPush()`)")
        creator.wait_for_timeout(600)
        creator.evaluate("DBG(`mpSend({type:'obj',x:6,y:6})`)")
        host.wait_for_timeout(500)
        check("players open doors", host.evaluate("DBG('OBJS.find(o=>o.x===6&&o.y===6).o')") is True)
        creator.evaluate("DBG('rot=2')")
        host.evaluate("DBG(`rot=1;save();mpPush()`)")
        creator.wait_for_timeout(600)
        check("each player keeps their own viewing angle", creator.evaluate("DBG('rot')") == 2)
        creator.evaluate("DBG(`tplSel='circle';TPLA=null;tplClick({x:3,y:3});mpSend({type:'envarea',a:{x:4,y:4},b:{x:5,y:5},k:'fire',dc:12})`)")
        host.wait_for_timeout(600)
        check(
            "players lay zones and effects",
            host.evaluate("id => DBG('TPLS.some(T=>T.by===' + JSON.stringify(id) + ') && ENV[\\'5,5\\'] && ENV[\\'5,5\\'].by===' + JSON.stringify(id))", created_id),
        )
        creator.evaluate("DBG(`pushRoll('<b>12</b>','Moi')`)")
        host.evaluate("DBG(`pushRoll('<b>3</b>','MJ')`)")
        creator.wait_for_timeout(700)
        mine = creator.evaluate("[...document.querySelectorAll('#rl_list li.mine .rlw')].map(l=>l.innerText.toUpperCase()).join('|')")
        check("your own rolls stand out", "MOI" in mine and "MJ" not in mine, mine)
        spec = ctx.new_page()
        spec.goto(url + "?debug=1&local=1")
        spec.wait_for_timeout(800)
        spec.evaluate(f"DBG(\"mpJoin('{code}',{{role:'spec',name:'Bob'}})\")")
        spec.wait_for_timeout(800)
        spec.evaluate("DBG(`pushRoll('<b>99</b>','Spec')`)")
        host.wait_for_timeout(400)
        check(
            "spectators watch without acting",
            spec.evaluate("DBG('MP.prole')") == "spec" and not host.evaluate("DBG('RL.some(r=>r.s===\\'Spec\\')')"),
        )
        pix = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        host.evaluate(f"DBG(`imgShow({{id:'i1',n:'Carte',d:'{pix}'}})`)")
        player.wait_for_timeout(500)
        check(
            "an image shown by the GM reaches the players",
            player.evaluate("DBG('IMGSHOW&&IMGSHOW.n')") == "Carte" and player.evaluate("!!document.querySelector('#imgdlg[open]')"),
        )
        player.evaluate("""DBG(`pushRoll('<b>18</b><img src=x onerror="window.PWN=1">','Test')`)""")
        host.wait_for_timeout(500)
        got = host.evaluate("DBG('RL[0].h')")
        check("remote roll is sanitized", got == "<b>18</b>" and not host.evaluate("window.PWN||0"), got)

        check("no script error during the run", not errors, "; ".join(errors[:3]))
        browser.close()
    srv.shutdown()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--chrome", help="path to Chrome/Chromium")
    args = ap.parse_args()
    chrome = args.chrome or next(
        (shutil.which(n) for n in ("google-chrome", "chromium", "chromium-browser") if shutil.which(n)), None
    )
    run(chrome)
    print(f"\n{len(FAILS)} failure(s)" if FAILS else "\nAll checks passed.")
    return len(FAILS)


if __name__ == "__main__":
    sys.exit(main())
