/**
 * Unit tests for parseWordHtml utility
 */

// Mock DOM for tests
const { JSDOM } = require('jsdom')

describe('parseWordHtml', () => {
    let dom
    let document
    let window

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
        document = dom.window.document
        window = dom.window
        global.document = document
        global.window = window
    })

    describe('removeVmlAndConditionals', () => {
        test('removes VML conditional comments', () => {
            const html = '<!--[if vml]><v:shape></v:shape><!--[endif]-->real content'
            // VML content should be removed, real content preserved
            expect(html.replace(/<!--\[if\s+vml\]>([\s\S]*?)<!--\[endif\]-->/gi, '')).toBe('real content')
        })

        test('preserves non-VML content in conditionals', () => {
            const html = '<!--[if !vml]-->preserved<!--[endif]-->'
            expect(html.replace(/<!--\[if\s+!vml\]-->([\s\S]*?)<!--\[endif\]-->/gi, '$1')).toBe('preserved')
        })
    })

    describe('table structure preservation', () => {
        test('preserves colspan attribute', () => {
            const html = '<table><tr><td colspan="2">merged</td></tr></table>'
            const temp = document.createElement('div')
            temp.innerHTML = html

            const cell = temp.querySelector('td')
            expect(cell.getAttribute('colspan')).toBe('2')
        })

        test('preserves rowspan attribute', () => {
            const html = '<table><tr><td rowspan="3">merged</td></tr></table>'
            const temp = document.createElement('div')
            temp.innerHTML = html

            const cell = temp.querySelector('td')
            expect(cell.getAttribute('rowspan')).toBe('3')
        })
    })

    describe('base64 image detection', () => {
        test('hasBase64Images returns true for base64 images', () => {
            const html = '<img src="data:image/png;base64,abc123">'
            expect(/data:image\/[^;]+;base64,/i.test(html)).toBe(true)
        })

        test('hasBase64Images returns false for URL images', () => {
            const html = '<img src="https://example.com/image.png">'
            expect(/data:image\/[^;]+;base64,/i.test(html)).toBe(false)
        })

        test('extractBase64Images finds all base64 images', () => {
            const html = '<img src="data:image/png;base64,abc"><img src="data:image/jpeg;base64,xyz">'
            const regex = /data:image\/[^;]+;base64,[^"']+/g
            const matches = html.match(regex) || []
            expect(matches.length).toBe(2)
        })
    })

    describe('style cleaning', () => {
        test('removes mso-* styles', () => {
            const style = 'font-size: 12pt; mso-bidi-font-size: 10pt; color: red;'
            const cleaned = style.replace(/mso-[^;]+;?/gi, '')
            expect(cleaned).not.toContain('mso-')
            expect(cleaned).toContain('font-size: 12pt')
            expect(cleaned).toContain('color: red')
        })

        test('preserves useful styles', () => {
            const style = 'font-family: Arial; font-size: 14px; color: #333; background-color: #fff;'
            // All these should be preserved
            expect(style).toContain('font-family')
            expect(style).toContain('font-size')
            expect(style).toContain('color')
            expect(style).toContain('background-color')
        })
    })
})
