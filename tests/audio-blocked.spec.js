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
test.use({launchOptions:{args:['--autoplay-policy=document-user-activation-required']}});
test.describe('browser blocks autoplay',()=>{
  test('first gesture starts unmuted playback from 27 seconds',async({page})=>{
    await prepare(page);
    await expect(page.getByRole('button',{name:'SOUND OFF'})).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>window.__tracks.at(-1).currentTime)).toBe(27);
    await page.keyboard.press('a');
    await expect(page.getByRole('button',{name:'SOUND ON'})).toBeVisible();
    expect(await page.evaluate(()=>window.__tracks.at(-1).muted)).toBe(false);
    expect(await page.evaluate(()=>window.__tracks.at(-1).currentTime)).toBeGreaterThanOrEqual(27);
  });
});
