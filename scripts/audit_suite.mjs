import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('====================================================');
  console.log('SAHAYAK 3D — AUTOMATED AUDIT SUITE (Playwright + Axe)');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const screenshotsDir = path.resolve('public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // -----------------------------------------------------------------
  // 1. RESPONSIVE VIEWPORT & TAP-TARGET AUDIT (360px, 768px, 1280px)
  // -----------------------------------------------------------------
  console.log('--- 1. VIEWPORT & TAP TARGET CHECKS (360px, 768px, 1280px) ---');
  const viewports = [
    { name: 'mobile-360px', width: 360, height: 740 },
    { name: 'tablet-768px', width: 768, height: 1024 },
    { name: 'desktop-1280px', width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/?quality=full`, { waitUntil: 'networkidle' });
    // Dismiss onboarding if present
    try {
      const skipBtn = await page.$('button:has-text("Skip"), button:has-text("छोड़ें")');
      if (skipBtn) await skipBtn.click();
    } catch {}

    await page.waitForTimeout(1000);

    const shotPath = path.join(screenshotsDir, `${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`[Screenshot Saved] ${vp.name}: ${shotPath}`);

    // Check tap targets on interactive elements
    const under44 = await page.evaluate(() => {
      const interactives = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
      const small = [];
      for (const el of interactives) {
        // Skip hidden or zero-size elements
        if (el.classList.contains('sr-only')) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none') continue;
        
        // WCAG 2.5.5 target size threshold is 44x44
        if (rect.width < 44 || rect.height < 44) {
          small.push({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().slice(0, 30),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            id: el.id || undefined,
            className: el.className ? el.className.slice(0, 40) : undefined,
          });
        }
      }
      return small;
    });

    if (under44.length === 0) {
      console.log(`  ✔ Viewport ${vp.width}px: All visible interactive targets meet or exceed 44x44px.`);
    } else {
      console.log(`  ⚠ Viewport ${vp.width}px: Found ${under44.length} element(s) under 44px:`);
      under44.forEach((it) => {
        console.log(`    - <${it.tag}> "${it.text}": ${it.width}x${it.height}px`);
      });
    }
    await context.close();
  }

  // -----------------------------------------------------------------
  // 2. AXE-CORE AUDITS ACROSS ALL REQUIRED UX STATES
  // -----------------------------------------------------------------
  console.log('\n--- 2. AXE-CORE MULTI-STATE ACCESSIBILITY AUDIT ---');

  const states = [
    {
      name: 'First View (Default English, Clean Train Scene + Start Journey)',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(600);
      },
    },
    {
      name: 'First View (Hindi Localization Mode)',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        await page.evaluate(() => {
          localStorage.setItem('sahayak_language', 'hi');
          localStorage.setItem('sahayak_onboarding_seen', 'true');
        });
        await page.reload({ waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("छोड़ें")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(600);
      },
    },
    {
      name: 'Elder Accessibility Mode',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        await page.evaluate(() => {
          localStorage.setItem('sahayak_elder_mode', 'true');
          localStorage.setItem('sahayak_onboarding_seen', 'true');
        });
        await page.reload({ waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(600);
      },
    },
    {
      name: 'Collapsible "Demo tools" Drawer Open',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(500);
        // Click Demo tools trigger
        const trigger = await page.$('#demo-tools-trigger');
        if (trigger) {
          await trigger.click();
        } else {
          await page.evaluate(() => {
            window.__journeyStore?.getState()?.setDemoToolsOpen?.(true);
          });
        }
        await page.waitForTimeout(500);
      },
    },
    {
      name: 'Active Journey Running ("Simulate a problem" CTA)',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          window.__journeyStore?.getState()?.startJourney?.();
        });
        await page.waitForTimeout(600);
      },
    },
    {
      name: 'Disruption Decision Cards Overlay (With "Why this ranking?" expander)',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          window.__journeyStore?.getState()?.startJourney?.();
          window.__journeyStore?.getState()?.setDisruptionType?.('delay');
        });
        await page.waitForTimeout(600);
      },
    },
    {
      name: 'Resolved Outcome Screen (Outcome summary + Undo button)',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          const store = window.__journeyStore?.getState();
          store?.startJourney?.();
          store?.setDisruptionType?.('delay');
        });
        await page.waitForTimeout(400);
        // Click the first confirm option button
        const confirmBtn = await page.$('button:has-text("Confirm Option"), button:has-text("विकल्प चुनें")');
        if (confirmBtn) {
          await confirmBtn.click();
        } else {
          await page.evaluate(() => {
            const store = window.__journeyStore?.getState();
            store?.confirmOption?.({
              id: 'opt-wait-short',
              titleEn: 'Hold on Main Track for Signal Clearance',
              titleHi: 'सिग्नल क्लीयरेंस के लिए मुख्य ट्रैक पर रुकें',
              actionType: 'resume',
              delayDeltaMinutes: 25,
              costInRupees: 0,
              comfortScore: 92,
              transfers: 0,
              newEta: '16:45',
              seatNote: 'Stay in your current reserved coach and berth with AC running.',
            });
          });
        }
        await page.waitForTimeout(600);
      },
    },
    {
      name: 'Onboarding Modal Open',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        await page.evaluate(() => {
          localStorage.removeItem('sahayak_onboarding_seen');
          window.__journeyStore?.getState()?.setIsOnboardingOpen?.(true);
        });
        await page.waitForSelector('div[role="dialog"]', { timeout: 3000 });
        await page.waitForTimeout(500);
      },
    },
    {
      name: 'Family Share Modal Open',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          window.__journeyStore?.getState()?.setFamilyShareOpen?.(true);
        });
        await page.waitForSelector('div[role="dialog"]', { timeout: 3000 });
        await page.waitForTimeout(500);
      },
    },
    {
      name: 'Voice Assistant Modal Open',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          window.__journeyStore?.getState()?.setVoiceAssistantOpen?.(true);
        });
        await page.waitForSelector('div[role="dialog"]', { timeout: 3000 });
        await page.waitForTimeout(500);
      },
    },
    {
      name: 'Journey Timeline Modal Open',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        try {
          const skipBtn = await page.$('button:has-text("Skip")');
          if (skipBtn) await skipBtn.click();
        } catch {}
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          window.__journeyStore?.getState()?.setTimelineOpen?.(true);
        });
        await page.waitForSelector('div[role="dialog"]', { timeout: 3000 });
        await page.waitForTimeout(500);
      },
    },
    {
      name: '404 Not Found Page (/nonexistent-route)',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/nonexistent-route`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
      },
    },
    {
      name: 'Design System Page (/design-system)',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/design-system`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
      },
    },
  ];

  const auditSummary = [];

  for (const st of states) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    try {
      await st.setup(page);
      const results = await new AxeBuilder({ page }).analyze();
      
      const violations = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map((n) => n.html).slice(0, 3),
      }));

      auditSummary.push({
        state: st.name,
        passed: results.passes.length,
        incomplete: results.incomplete.length,
        violationsCount: violations.length,
        violations,
      });

      if (violations.length === 0) {
        console.log(`✔ [${st.name}] 0 axe violations (${results.passes.length} rules passed)`);
      } else {
        console.log(`❌ [${st.name}] ${violations.length} violation(s):`);
        violations.forEach((v) => {
          console.log(`   - [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
          v.nodes.forEach((html) => console.log(`     Node: ${html}`));
        });
      }
    } catch (err) {
      console.error(`Error auditing ${st.name}:`, err.message);
    } finally {
      await context.close();
    }
  }

  const reportsDir = path.resolve('docs', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const reportPath = path.join(reportsDir, 'axe-multi-state-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditSummary, null, 2));
  console.log(`\n[Report Written] ${reportPath}`);
}

run().catch((e) => {
  console.error('Audit suite error:', e);
  process.exit(1);
});
