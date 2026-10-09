const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');
const pickerCss = fs.readFileSync(path.join(projectRoot, 'public', 'assets', 'css', 'dx-date-picker.css'), 'utf8');
const pickerJs = fs.readFileSync(path.join(projectRoot, 'public', 'assets', 'js', 'dx-date-picker.js'), 'utf8');
const alpineJs = fs.readFileSync(path.join(projectRoot, 'public', 'assets', 'js', 'alpine.min.js'), 'utf8');

test('datetime picker footer stays inside the popover', { timeout: 10_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 740, deviceScaleFactor: 1 });
    await page.setContent(`
        <style>${pickerCss}</style>
        <input id="date" type="datetime-local" value="2026-10-16T09:00" style="margin:18px;width:270px;height:40px">
    `);
    await page.addScriptTag({ content: pickerJs });
    await page.click('.dx-date-field-trigger');

    const layout = await page.evaluate(() => {
        const popover = document.querySelector('.dx-date-picker-popover').getBoundingClientRect();
        const footer = document.querySelector('.dx-date-picker-foot').getBoundingClientRect();
        const children = [...document.querySelectorAll('.dx-date-picker-foot .dx-date-picker-quick')]
            .map(element => element.getBoundingClientRect());
        return {
            popoverRight: popover.right,
            footerRight: footer.right,
            widestChildRight: Math.max(...children.map(rect => rect.right)),
            viewportWidth: window.innerWidth
        };
    });

    assert.ok(layout.popoverRight <= layout.viewportWidth);
    assert.ok(layout.widestChildRight <= layout.footerRight + 0.5);
});

test('switching to an all-day event keeps the chosen date and removes its time', { timeout: 10_000 }, async (t) => {
    const browser = await puppeteer.launch({ headless: true });
    t.after(() => browser.close());
    const page = await browser.newPage();
    await page.setContent(`
        <style>${pickerCss}</style>
        <div x-data="{
            allDay: false,
            startAt: '2026-10-16T09:00',
            setAllDay(enabled) {
                this.allDay = enabled;
                this.startAt = enabled ? this.startAt.slice(0, 10) : this.startAt + 'T09:00';
                this.$nextTick(() => window.DxDatePicker.refresh(this.$refs.start));
            }
        }">
            <input id="all-day" type="checkbox" :checked="allDay" @change="setAllDay($event.target.checked)">
            <input id="start" x-ref="start" type="datetime-local" :type="allDay ? 'date' : 'datetime-local'" x-model="startAt">
        </div>
    `);
    await page.addScriptTag({ content: pickerJs });
    await page.addScriptTag({ content: alpineJs });
    await page.waitForSelector('.dx-date-field-trigger');
    await page.click('#all-day');
    await new Promise(resolve => setTimeout(resolve, 250));

    const value = await page.evaluate(() => ({
        type: document.querySelector('#start').type,
        value: document.querySelector('#start').value,
        label: document.querySelector('.dx-date-field-trigger-label').textContent
    }));
    assert.deepEqual(value, {
        type: 'date',
        value: '2026-10-16',
        label: '16 oct 2026'
    });
});
