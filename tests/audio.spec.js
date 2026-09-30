import { test, expect } from '@playwright/test';
async function prepare(page) {
  await page.clock.install({time:new Date('2026-10-01T06:00:00Z')});
  await page.addInitScript(() => {
    const NativeAudio=window.Audio;
    window.__tracks=[];
    window.Audio=class extends NativeAudio {
      constructor(...args) { super(...args); window.__tracks.push(this); }
    };
  });
  await page.goto('/');
  await expect(page.locator('.loader')).toBeHidden({timeout:20000});
}
test.use({launchOptions:{args:['--autoplay-policy=no-user-gesture-required']}});
test.describe('audible autoplay allowed',()=>{
  test('audio starts at 27 seconds and manual pause remains respected',async({page})=>{
    await prepare(page);
    await expect(page.getByRole('button',{name:'SOUND ON'})).toHaveAttribute('aria-pressed','true');
    const track=await page.evaluate(()=>{const a=window.__tracks.at(-1);return {time:a.currentTime,muted:a.muted,paused:a.paused};});
    expect(track.time).toBeGreaterThanOrEqual(27);
    expect(track.time).toBeLessThan(45);
    expect(track.muted).toBe(false);
    expect(track.paused).toBe(false);
    await page.getByRole('button',{name:'SOUND ON'}).click();
    await expect(page.getByRole('button',{name:'SOUND OFF'})).toHaveAttribute('aria-pressed','false');
    await page.keyboard.press('a');
    expect(await page.evaluate(()=>window.__tracks.at(-1).paused)).toBe(true);
    await page.getByRole('button',{name:'SOUND OFF'}).click();
    await expect(page.getByRole('button',{name:'SOUND ON'})).toHaveAttribute('aria-pressed','true');
  });
});
