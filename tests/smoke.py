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
        ctx = browser.new_context(viewport={"width": 1400, "height": 900}, accept_downloads=True)
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

        # right-click menus and campaign deletion (characters are kept)
        page.evaluate("DBG(`CH.list.push({...blankC(),id:'z1',name:'Zed',camp:'Temp'});saveC();deleteCampaign('Temp')`)")
        check(
            "deleting a campaign keeps its characters",
            D("CH.list.some(c=>c.id==='z1'&&!c.camp) && !campaignFolders().includes('Temp')"),
        )
        page.evaluate("DBG(`ctxMenu(10,10,[{label:'x',fn:()=>{}}])`)")
        check("context menu opens", page.locator(".ctxm").count() == 1)
        page.keyboard.press("Escape")

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
        host.evaluate("DBG('mpHost()')")
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
        creator.goto(url + "?debug=1&local=1")
        creator.wait_for_timeout(800)
        creator.evaluate(f"DBG(\"mpJoin('{code}',{{name:'Creator'}})\")")
        creator.wait_for_function("DBG('MP.got')")
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
        creator.evaluate("DBG(`placing={ally:MP.me,n:'x'};setTool('place');apply({x:2,y:2})`)")
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
