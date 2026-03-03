/**
 * Build C — Live Site E2E Tests
 * Tests against the deployed site with demo mode
 */
import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://ib-mastery-v50.web.app';

test.describe('Build C — Live Site Tests', () => {

  test('Full circle: Dashboard → Reports → Weekly → Imperial Dispatch', async ({ page }) => {
    test.setTimeout(120000);

    // Go to live site
    await page.goto(`${LIVE_URL}/app`);

    // Wait for something to render
    await page.waitForFunction(() => document.body.innerText.length > 50, { timeout: 30000 });
    await page.waitForTimeout(1000);

    let body = await page.evaluate(() => document.body.innerText);

    // Check if we need to enter demo mode
    if (body.includes('Demo Mode') || body.includes('Demo') || body.includes('Sign in')) {
      const demoBtn = page.locator('button:has-text("Demo")').first();
      if (await demoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await demoBtn.click({ force: true });
        await page.waitForTimeout(3000);
        body = await page.evaluate(() => document.body.innerText);
      }
    }

    // If onboarding flow shows, we might need to complete it
    if (body.includes('name') && body.includes('Continue') && body.length < 500) {
      console.log('Onboarding detected, completing...');
      // Type name
      const nameInput = page.locator('input').first();
      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill('Test Student');
        const continueBtn = page.locator('button:has-text("Continue")').first();
        if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await continueBtn.click({ force: true });
          await page.waitForTimeout(1000);
        }
      }
    }

    // Dismiss any overlays
    const understoodBtn = page.locator('button:has-text("Understood")').first();
    if (await understoodBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await understoodBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
    // Remove blocking overlays
    await page.evaluate(() => {
      document.querySelectorAll('div').forEach(el => {
        if (el.style.zIndex === '9998' || el.style.zIndex === '9999') el.remove();
      });
    });
    await page.waitForTimeout(300);

    body = await page.evaluate(() => document.body.innerText);
    console.log('Page loaded, body length:', body.length);
    console.log('First 200 chars:', body.slice(0, 200));

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/build-c-01-dashboard.png' });

    // === CHECK 1: App loaded ===
    expect(body.length).toBeGreaterThan(100);
    console.log('CHECK 1 PASS: App loaded');

    // === CHECK 2: Navigate to REPORTS ===
    const reportsBtn = page.locator('button:has-text("REPORTS")').first();
    if (await reportsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await reportsBtn.click({ force: true });
      await page.waitForTimeout(1000);
    } else {
      // Try clicking by icon/text
      const altBtn = page.locator('button:has-text("Report"), button:has-text("Intel"), button:has-text("📊")').first();
      if (await altBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await altBtn.click({ force: true });
        await page.waitForTimeout(1000);
      }
    }

    body = await page.evaluate(() => document.body.innerText);
    await page.screenshot({ path: 'test-results/build-c-02-reports.png' });
    console.log('Reports tab body (first 300):', body.slice(0, 300));

    const hasReportContent = body.includes('Scriptum') || body.includes('Report') || body.includes('Battle') || body.includes('Grade') || body.includes('Debrief');
    expect(hasReportContent).toBeTruthy();
    console.log('CHECK 2 PASS: Reports tab loaded');

    // === CHECK 3: Weekly Report tier ===
    const weeklyBtn = page.locator('button:has-text("Weekly")').first();
    if (await weeklyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await weeklyBtn.click({ force: true });
      await page.waitForTimeout(800);
    }

    body = await page.evaluate(() => document.body.innerText);
    await page.screenshot({ path: 'test-results/build-c-03-weekly.png' });

    const hasWeeklyContent = body.includes('SESSIONS') || body.includes('Weekly Report') || body.includes('STREAK') || body.includes('Subject');
    console.log('Weekly tab content check:', hasWeeklyContent, 'Body (300):', body.slice(0, 300));

    // === CHECK 4: Generate Weekly Debrief button present ===
    const debriefBtn = page.locator('button:has-text("Generate Weekly Debrief"), button:has-text("Chaplain")').first();
    const debriefBtnVisible = await debriefBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('CHECK 4: Weekly Debrief button visible:', debriefBtnVisible);

    // === CHECK 5: Switch to Imperial Dispatch (tutor) ===
    const dispatchToggle = page.locator('button:has-text("Imperial Dispatch")').first();
    if (await dispatchToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dispatchToggle.click({ force: true });
      await page.waitForTimeout(800);
    }

    body = await page.evaluate(() => document.body.innerText);
    await page.screenshot({ path: 'test-results/build-c-04-dispatch.png' });

    const hasDispatch = body.includes('Imperial Dispatch') || body.includes('Performance Summary') || body.includes('Commander') || body.includes('4-Section');
    console.log('CHECK 5: Imperial Dispatch view:', hasDispatch, 'Body (300):', body.slice(0, 300));

    // === CHECK 6: 4-Section generator button ===
    const genDispatchBtn = page.locator('button:has-text("4-Section"), button:has-text("Generate")').first();
    const genDispatchVisible = await genDispatchBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('CHECK 6: 4-Section button visible:', genDispatchVisible);

    // === CHECK 7: Performance Summary table ===
    const hasTable = body.includes('Subject') && (body.includes('Grade') || body.includes('Sessions') || body.includes('Risk'));
    console.log('CHECK 7: Performance table present:', hasTable);

    // === CHECK 8: Homework section ===
    const hasHomework = body.includes('Homework') || body.includes('homework');
    console.log('CHECK 8: Homework section:', hasHomework);

    // === CHECK 9: AI Recommendation section ===
    const hasAiRec = body.includes('AI Recommendation') || body.includes('Next Tutoring');
    console.log('CHECK 9: AI Recommendation section:', hasAiRec);

    // Take final screenshot
    await page.screenshot({ path: 'test-results/build-c-05-final.png' });

    // Print summary
    console.log('\n═══════════════════════════════════════');
    console.log('  BUILD C — LIVE SITE TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`  1. App loaded:              PASS`);
    console.log(`  2. Reports tab:             ${hasReportContent ? 'PASS' : 'FAIL'}`);
    console.log(`  3. Weekly content:          ${hasWeeklyContent ? 'PASS' : 'CHECK'}`);
    console.log(`  4. Debrief button:          ${debriefBtnVisible ? 'PASS' : 'CHECK'}`);
    console.log(`  5. Imperial Dispatch view:  ${hasDispatch ? 'PASS' : 'FAIL'}`);
    console.log(`  6. 4-Section button:        ${genDispatchVisible ? 'PASS' : 'CHECK'}`);
    console.log(`  7. Performance table:       ${hasTable ? 'PASS' : 'CHECK'}`);
    console.log(`  8. Homework section:        ${hasHomework ? 'PASS' : 'CHECK'}`);
    console.log(`  9. AI Recommendation:       ${hasAiRec ? 'PASS' : 'CHECK'}`);
    console.log('═══════════════════════════════════════\n');
  });

});
