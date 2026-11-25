"""Rasterize the world map: world-full.svg -> world-hi.webp (4x) and world-lo.webp (2x).

The sea (gradient by distance to the coast, coastal isolines) is computed with NumPy/SciPy and
composited under the land. world.svg keeps only the interactive vector layers (borders, burgs,
state labels). Chrome renders the SVG through Playwright: the browser Playwright installed is
used unless a path is given.
"""
from __future__ import annotations

import io
import re
import shutil
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from scipy import ndimage


def find_chrome() -> str | None:
    """A system Chrome/Chromium if there is one (Playwright's own browser otherwise)."""
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome"):
        path = shutil.which(name)
        if path:
            return path
    return None


def rasterize(full_svg: Path, out_dir: Path, chrome: str | None = None, lo_quality: int = 70) -> tuple[int, int]:
    """Write world-hi.webp, world-lo.webp and world.svg into out_dir; return the size of the hi image."""
    out_dir = Path(out_dir)
    s=Path(full_svg).read_text(encoding='utf-8')
    W,H=map(float,re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"',s).groups())
    keep={g:re.search(r'<g id="%s".*?</g>(?=<g id=|</svg>)'%g,s,flags=re.S).group(0) for g in ('w-borders','w-burgs','w-slabels')}
    art=s
    for g in keep.values(): art=art.replace(g,'')
    html=f'<html><body style="margin:0;background:transparent">{art.replace("<svg ","<svg width=\"%d\" height=\"%d\" "%(W,H),1)}</body></html>'
    with sync_playwright() as p:
        b=p.chromium.launch(**({'executable_path':str(chrome)} if chrome else {}));pg=b.new_page(viewport={'width':int(W),'height':int(H)},device_scale_factor=4)
        pg.set_content(html);pg.wait_for_timeout(800);png=pg.screenshot(clip={'x':0,'y':0,'width':W,'height':H},omit_background=True);b.close()
    land=Image.open(io.BytesIO(png)).convert('RGBA')
    w,h=land.size;S=2  # sea computed at 2 px per map unit, then upscaled
    a=np.asarray(land.split()[3].resize((int(W*S),int(H*S)),Image.BILINEAR))>40
    d=ndimage.distance_transform_edt(~a)/S            # distance to coast, map units
    rng=np.random.default_rng(7)
    def noise(sc,amp):
        n=rng.normal(0,1,(int(H*S/sc)+2,int(W*S/sc)+2)).astype(np.float32)
        return np.asarray(Image.fromarray(n).resize((int(W*S),int(H*S)),Image.BICUBIC))*amp
    dn=d+noise(40,6)+noise(12,1.5)
    stops=[(0,(216,239,242)),(10,(190,226,234)),(28,(158,205,222)),(60,(124,180,208)),(120,(96,151,190)),(220,(78,131,174)),(400,(66,116,162))]
    xs=np.array([x for x,_ in stops],np.float32);col=np.zeros(d.shape+(3,),np.float32)
    for c in range(3): col[...,c]=np.interp(dn,xs,np.array([v[c] for _,v in stops],np.float32))
    # isolines following the coast, broken into strokes
    dash=noise(10,1.0)+noise(3,.6)
    for sp,ofs,tone,alpha,lim in ((9,0,(45,100,150),.32,140),(9,4.5,(255,255,255),.22,110),(17,2,(40,92,140),.18,320)):
        ph=np.abs(((dn+ofs)%sp)-sp/2)                     # 0 at line centre
        line=np.clip(1-ph/0.55,0,1)*(dash>-.2)*(d<lim)*(d>2.5)*np.clip(1-d/lim,0.15,1)
        col=col*(1-alpha*line[...,None])+np.array(tone,np.float32)*(alpha*line[...,None])
    sea=Image.fromarray(col.clip(0,255).astype(np.uint8)).resize((w,h),Image.BICUBIC)
    im=sea.convert('RGBA');im.alpha_composite(land);im=im.convert('RGB')
    im.save(out_dir/'world-hi.webp',quality=82,method=6)
    im.resize((im.width//2,im.height//2),Image.LANCZOS).save(out_dir/'world-lo.webp',quality=lo_quality,method=6)
    (out_dir/'world.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:g} {H:g}" id="wsvg">'+''.join(keep.values())+'</svg>',encoding='utf-8')
    return im.size
