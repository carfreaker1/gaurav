import { test, expect } from '@playwright/test';

async function openLifestyle(page) {
  await page.clock.install({time:new Date('2026-10-01T06:00:00Z')});
  await page.route('https://www.instagram.com/**', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.loader')).toBeHidden({ timeout: 20000 });
}

test('lifestyle, 3D gallery, scroll typography, media and message work', async ({ page }, info) => {
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await openLifestyle(page);
  await expect(page.getByRole('heading',{name:/Out of the ordinary/})).toBeVisible();
  await expect(page.locator('.birthday-dialog')).not.toBeVisible();
  await expect(page.locator('.hero-stage canvas')).toBeVisible();
  await expect(page.getByRole('button',{name:'SOUND OFF'})).toHaveAttribute('aria-pressed','false');
  await page.screenshot({path:'test-results/'+info.project.name+'-lifestyle-hero.png',scale:'css'});
  const before=await page.locator('.velocity-line').first().evaluate(el=>getComputedStyle(el).transform);
  await page.locator('.velocity-section').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.locator('.velocity-line').first().evaluate(el=>getComputedStyle(el).transform)).not.toBe(before);
  await page.getByRole('button',{name:'Next moment'}).click();
  await expect(page.getByRole('button',{name:/STYLE$/})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'VIEW MOMENT'}).click();
  await expect(page.getByRole('dialog',{name:'STYLE gallery preview'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.lightbox')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'VIEW MOMENT'})).toBeFocused();
  await page.getByRole('button',{name:/ENERGY$/}).click();
  await page.getByRole('button',{name:'PLAY FILM'}).click();
  await expect(page.locator('video')).toBeVisible();
  await expect(page.locator('video')).toHaveAttribute('controls','');
  await page.getByRole('button',{name:'Close preview'}).click();
  await page.getByRole('button',{name:'MAKE THIS MESSAGE YOURS'}).click();
  await page.getByLabel('Your birthday message').fill('For the memories still to come. Happy birthday!');
  await page.getByRole('button',{name:'SAVE MESSAGE'}).click();
  await expect(page.locator('.personal-message')).toHaveText('For the memories still to come. Happy birthday!');
  await page.reload();
  await expect(page.locator('.loader')).toBeHidden({timeout:15000}).catch(async error=>{console.log(await page.evaluate(()=>({date:new Date().toISOString(),html:document.body.innerHTML.slice(0,4500)})));throw error;});
  await expect(page.locator('.personal-message')).toHaveText('For the memories still to come. Happy birthday!');
  await page.getByRole('link',{name:'VISIT INSTAGRAM'}).scrollIntoViewIfNeeded();
  await expect(page.locator('.social-fallback')).toBeVisible();
  await expect(page.getByRole('link',{name:'VISIT INSTAGRAM'})).toHaveAttribute('href','https://www.instagram.com/vip_gaurav_01/');
  await expect(page.getByRole('link',{name:'Created by @carfreaker1'})).toHaveAttribute('href','https://www.instagram.com/carfreaker1');
  if(info.project.name==='mobile'){
    await page.getByRole('button',{name:'Open menu'}).click();
    await page.getByRole('navigation').getByRole('link',{name:'Message'}).click();
    await expect(page.getByRole('button',{name:'Open menu'})).toHaveAttribute('aria-expanded','false');
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});

test('birthday opens annually, once per session, with a manual replay',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.clock.install({time:new Date('2026-09-30T06:00:00Z')});
  await page.goto('/');
  await expect(page.getByRole('dialog',{name:/HAPPY BIRTHDAY/})).toBeVisible({timeout:20000});
  await expect(page.locator('.birthday-reveal')).toContainText('2026');
  await page.screenshot({path:'test-results/'+info.project.name+'-birthday.png',scale:'css'});
  await page.getByRole('button',{name:'Close birthday celebration'}).click();
  await expect(page.locator('.birthday-dialog')).not.toBeVisible();
  await page.reload();
  await expect(page.locator('.loader')).toBeHidden({timeout:15000});
  await expect(page.locator('.birthday-dialog')).not.toBeVisible();
  await page.getByRole('button',{name:'REPLAY BIRTHDAY MOMENT'}).click();
  await expect(page.locator('.birthday-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.birthday-dialog')).not.toBeVisible();
  await page.clock.setSystemTime(new Date('2027-09-30T06:00:00Z'));
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.birthday-dialog')).toBeVisible({timeout:15000});
  await expect(page.locator('.birthday-reveal')).toContainText('2027');
  await page.getByRole('button',{name:'Close birthday celebration'}).click();
  await page.reload();
  await expect(page.locator('.loader')).toBeHidden({timeout:15000});
  await expect(page.locator('.birthday-dialog')).not.toBeVisible();
});

test('India midnight triggers birthday without a reload',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.clock.install({time:new Date('2028-09-29T18:28:00Z')});
  await page.goto('/');
  await expect(page.locator('.loader')).toBeHidden({timeout:20000});
  await expect(page.locator('.birthday-dialog')).not.toBeVisible();
  await page.clock.fastForward(125000);
  await expect(page.locator('.birthday-dialog')).toBeVisible({timeout:15000});
  await expect(page.locator('.birthday-reveal')).toContainText('2028');
});

test('reduced motion and unavailable WebGL keep the photo experience usable',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(['webgl','webgl2','experimental-webgl'].includes(type))return null;
      return original.call(this,type,...args);
    };
  });
  await openLifestyle(page);
  await expect(page.locator('.hero-stage .stage-fallback')).toBeVisible();
  await page.getByRole('button',{name:'Open gaurav photo'}).click();
  await expect(page.getByRole('dialog',{name:'GAURAV gallery preview'})).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('.velocity-section').scrollIntoViewIfNeeded();
  await expect(page.locator('.velocity-line').first()).toHaveCSS('transform','none');
  await page.getByRole('button',{name:'PREVIEW BIRTHDAY MOMENT'}).click();
  await expect(page.locator('.birthday-dialog')).toBeVisible();
});
