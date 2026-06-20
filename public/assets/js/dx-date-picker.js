(function () {
    'use strict';

    const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
    const ENHANCED_ATTR = 'data-dx-date-enhanced';
    const IGNORE_SELECTOR = '[data-dx-date-picker="off"], [data-dx-date-ignore], .dx-date-picker-popover input';
    const INPUT_SELECTOR = 'input[type="date"]:not([' + ENHANCED_ATTR + ']), input[type="datetime-local"]:not([' + ENHANCED_ATTR + ']), input[type="time"]:not([' + ENHANCED_ATTR + '])';

    const state = {
        popover: null,
        anchor: null,
        input: null,
        onSelect: null,
        onClose: null,
        value: '',
        selectedDate: '',
        selectedTime: '',
        month: '',
        type: 'date',
        min: '',
        max: '',
        closeOnSelect: true
    };

    function pad(value) {
        return String(value).padStart(2, '0');
    }

    function todayKey(offsetDays) {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() + Number(offsetDays || 0));
        return dateKey(date);
    }

    function dateKey(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return todayKey();
        return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
    }

    function dateFromKey(key) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key || ''))) return new Date();
        const [year, month, day] = key.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    function normalizeDate(value) {
        if (!value) return '';
        const str = String(value);
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
        const date = new Date(str);
        if (Number.isNaN(date.getTime())) return '';
        return dateKey(date);
    }

    function normalizeTime(value) {
        if (!value) return '';
        const str = String(value);
        const match = str.match(/T(\d{2}:\d{2})/) || str.match(/^(\d{2}:\d{2})/);
        return match ? match[1] : '';
    }

    function buildValue(date, time, type) {
        if (type === 'time') return time || '';
        if (!date) return '';
        if (type === 'datetime-local') return date + 'T' + (time || '09:00');
        return date;
    }

    function isDateTime(type) {
        return type === 'datetime-local';
    }

    function isTimeOnly(type) {
        return type === 'time';
    }

    function formatDateLabel(value) {
        const key = normalizeDate(value);
        if (!key) return '';
        const date = dateFromKey(key);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
    }

    function formatDateTimeLabel(value) {
        const date = formatDateLabel(value);
        const time = normalizeTime(value);
        if (!date) return '';
        return time ? date + ' · ' + time : date;
    }

    function formatTimeLabel(value) {
        return normalizeTime(value) || '';
    }

    function monthTitle() {
        const base = dateFromKey((state.month || todayKey()).slice(0, 7) + '-01');
        const label = base.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function withinBounds(key) {
        if (state.min && key < state.min) return false;
        if (state.max && key > state.max) return false;
        return true;
    }

    function calendarDays() {
        const monthKey = state.month || todayKey().slice(0, 7);
        const [year, month] = monthKey.split('-').map(Number);
        const base = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1, 12, 0, 0, 0);
        const start = new Date(base);
        const mondayOffset = (base.getDay() + 6) % 7;
        start.setDate(base.getDate() - mondayOffset);
        const today = todayKey();

        return Array.from({ length: 42 }, (_, index) => {
            const dayDate = new Date(start);
            dayDate.setDate(start.getDate() + index);
            const key = dateKey(dayDate);
            return {
                key,
                day: dayDate.getDate(),
                currentMonth: dayDate.getMonth() === base.getMonth(),
                selected: key === state.selectedDate,
                today: key === today,
                disabled: !withinBounds(key),
                label: dayDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            };
        });
    }

    function ensurePopover() {
        if (state.popover) return state.popover;
        const popover = document.createElement('div');
        popover.className = 'dx-date-picker-popover';
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-label', 'Choisir une date');
        popover.hidden = true;
        popover.addEventListener('click', event => event.stopPropagation());
        document.body.appendChild(popover);
        state.popover = popover;
        return popover;
    }

    function selectedHour() {
        return (normalizeTime(state.selectedTime) || '09:00').slice(0, 2);
    }

    function selectedMinute() {
        return (normalizeTime(state.selectedTime) || '09:00').slice(3, 5);
    }

    function timeColumnsMarkup() {
        const hour = selectedHour();
        const minute = selectedMinute();
        const hours = Array.from({ length: 24 }, (_, index) => pad(index));
        const minutes = Array.from({ length: 60 }, (_, index) => pad(index));
        return `
            <div class="dx-time-picker-panel">
                <div class="dx-time-picker-display">
                    <iconify-icon icon="solar:clock-circle-linear" width="14"></iconify-icon>
                    <span>${escapeHtml(hour)}:${escapeHtml(minute)}</span>
                </div>
                <div class="dx-time-picker-columns">
                    <div class="dx-time-picker-column" aria-label="Heure">
                        ${hours.map(value => `
                            <button type="button"
                                    class="dx-time-picker-option${value === hour ? ' is-selected' : ''}"
                                    data-dx-time-hour="${value}">
                                ${value}
                            </button>
                        `).join('')}
                    </div>
                    <div class="dx-time-picker-column" aria-label="Minute">
                        ${minutes.map(value => `
                            <button type="button"
                                    class="dx-time-picker-option${value === minute ? ' is-selected' : ''}"
                                    data-dx-time-minute="${value}">
                                ${value}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderTimeOnly(popover) {
        popover.classList.add('is-time-only');
        popover.innerHTML = `
            <div class="dx-date-picker-head">
                <div class="dx-date-picker-title">Choisir une heure</div>
            </div>
            ${timeColumnsMarkup()}
            <div class="dx-date-picker-foot">
                <button type="button" class="dx-date-picker-quick is-muted" data-dx-date-action="clear">Effacer</button>
                <button type="button" class="dx-date-picker-quick is-primary" data-dx-date-action="apply">Valider</button>
            </div>
        `;
    }

    function render() {
        const popover = ensurePopover();
        popover.classList.remove('is-time-only');
        if (isTimeOnly(state.type)) {
            renderTimeOnly(popover);
            bindPopoverEvents();
            positionPopover();
            scrollTimeSelection();
            return;
        }
        const isDateTimeMode = isDateTime(state.type);
        const timeRow = isDateTimeMode
            ? `<div class="dx-date-picker-time-row">${timeColumnsMarkup()}</div>`
            : '';
        const primaryAction = isDateTimeMode
            ? '<button type="button" class="dx-date-picker-quick is-primary" data-dx-date-action="apply">Valider</button>'
            : '';

        popover.innerHTML = `
            <div class="dx-date-picker-head">
                <div class="dx-date-picker-title">${escapeHtml(monthTitle())}</div>
                <div class="dx-date-picker-navs">
                    <button type="button" class="dx-date-picker-nav" data-dx-date-action="prev" title="Mois précédent" aria-label="Mois précédent">
                        <iconify-icon icon="tabler:chevron-left" width="15"></iconify-icon>
                    </button>
                    <button type="button" class="dx-date-picker-nav" data-dx-date-action="next" title="Mois suivant" aria-label="Mois suivant">
                        <iconify-icon icon="tabler:chevron-right" width="15"></iconify-icon>
                    </button>
                </div>
            </div>
            <div class="dx-date-picker-weekdays">
                ${WEEKDAYS.map(day => `<span>${day}</span>`).join('')}
            </div>
            <div class="dx-date-picker-grid">
                ${calendarDays().map(day => `
                    <button type="button"
                            class="dx-date-picker-day${day.currentMonth ? '' : ' is-muted'}${day.today ? ' is-today' : ''}${day.selected ? ' is-selected' : ''}${day.disabled ? ' is-disabled' : ''}"
                            data-dx-date-day="${day.key}"
                            aria-label="${escapeHtml(day.label)}"
                            ${day.disabled ? 'disabled' : ''}>
                        ${day.day}
                    </button>
                `).join('')}
            </div>
            ${timeRow}
            <div class="dx-date-picker-foot">
                <button type="button" class="dx-date-picker-quick is-muted" data-dx-date-action="clear">Effacer</button>
                <span style="display:inline-flex;gap:6px;margin-left:auto;">
                    <button type="button" class="dx-date-picker-quick" data-dx-date-action="today">
                        <iconify-icon icon="solar:calendar-date-linear" width="13"></iconify-icon>
                        Aujourd'hui
                    </button>
                    <button type="button" class="dx-date-picker-quick" data-dx-date-action="tomorrow">Demain</button>
                    ${primaryAction}
                </span>
            </div>
        `;
        bindPopoverEvents();
        positionPopover();
        scrollTimeSelection();
    }

    function bindPopoverEvents() {
        const popover = ensurePopover();
        popover.querySelectorAll('[data-dx-date-action]').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                handleAction(button.dataset.dxDateAction);
            });
        });
        popover.querySelectorAll('[data-dx-date-day]').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                selectDate(button.dataset.dxDateDay);
            });
        });
        popover.querySelectorAll('[data-dx-time-hour], [data-dx-time-minute]').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                updateSelectedTime(button.dataset.dxTimeHour, button.dataset.dxTimeMinute);
            });
        });
    }

    function updateSelectedTime(hour, minute) {
        const nextHour = hour || selectedHour();
        const nextMinute = minute || selectedMinute();
        state.selectedTime = nextHour + ':' + nextMinute;
        render();
    }

    function handleAction(action) {
        if (action === 'prev' || action === 'next') {
            const base = dateFromKey((state.month || todayKey().slice(0, 7)) + '-01');
            base.setMonth(base.getMonth() + (action === 'next' ? 1 : -1), 1);
            state.month = dateKey(base).slice(0, 7);
            render();
            return;
        }
        if (action === 'today' || action === 'tomorrow') {
            const key = todayKey(action === 'tomorrow' ? 1 : 0);
            if (!withinBounds(key)) return;
            selectDate(key);
            return;
        }
        if (action === 'clear') {
            applyValue('');
            close();
            return;
        }
        if (action === 'apply') {
            applySelection();
        }
    }

    function selectDate(key) {
        if (!withinBounds(key)) return;
        state.selectedDate = key;
        state.month = key.slice(0, 7);
        if (isDateTime(state.type)) {
            render();
            return;
        }
        applySelection();
    }

    function scrollTimeSelection() {
        if (!state.popover) return;
        requestAnimationFrame(() => {
            state.popover.querySelectorAll('.dx-time-picker-column').forEach(column => {
                const selected = column.querySelector('.dx-time-picker-option.is-selected');
                if (!selected) return;
                column.scrollTop = Math.max(0, selected.offsetTop - column.clientHeight / 2 + selected.clientHeight / 2);
            });
        });
    }

    function applySelection() {
        applyValue(buildValue(state.selectedDate, state.selectedTime, state.type));
        close();
    }

    function applyValue(value) {
        if (typeof state.onSelect === 'function') {
            state.onSelect(value);
        }
        if (state.input) {
            state.input.value = value;
            state.input.dispatchEvent(new Event('input', { bubbles: true }));
            state.input.dispatchEvent(new Event('change', { bubbles: true }));
            refreshTrigger(state.input);
        }
    }

    function positionPopover() {
        const popover = ensurePopover();
        const anchor = state.anchor;
        const rect = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : null;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 320;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 480;
        const margin = 8;
        const panelWidth = isTimeOnly(state.type) ? Math.min(236, Math.max(220, viewportWidth - 24)) : Math.min(270, Math.max(240, viewportWidth - 24));
        const panelHeight = isTimeOnly(state.type) ? 286 : (isDateTime(state.type) ? 418 : 318);
        const left = rect ? rect.left : margin;
        const top = rect ? rect.bottom + 8 : margin;
        const x = Math.max(margin, Math.min(left, viewportWidth - panelWidth - margin));
        let y = Math.max(margin, top);
        if (rect && y + panelHeight > viewportHeight - margin) {
            y = Math.max(margin, rect.top - panelHeight - margin);
        }
        popover.style.left = x + 'px';
        popover.style.top = y + 'px';
    }

    function open(options) {
        const opts = options || {};
        const value = opts.value == null ? '' : String(opts.value);
        const type = opts.type || (opts.input && opts.input.type) || 'date';
        const selectedDate = normalizeDate(value) || todayKey();
        close(false, false);
        state.anchor = opts.anchor || opts.input || null;
        state.input = opts.input || null;
        state.onSelect = opts.onSelect || null;
        state.onClose = opts.onClose || null;
        state.type = type;
        state.value = value;
        state.selectedDate = selectedDate;
        state.selectedTime = normalizeTime(value) || opts.defaultTime || '';
        state.month = selectedDate.slice(0, 7);
        state.min = normalizeDate(opts.min || (opts.input && opts.input.min) || '');
        state.max = normalizeDate(opts.max || (opts.input && opts.input.max) || '');
        render();
        const popover = ensurePopover();
        popover.hidden = false;
        requestAnimationFrame(positionPopover);
    }

    function close(clearState, notify) {
        const shouldNotify = notify !== false;
        const onClose = state.onClose;
        const wasOpen = state.popover && !state.popover.hidden;
        if (state.popover) {
            state.popover.hidden = true;
        }
        if (wasOpen && shouldNotify && typeof onClose === 'function') {
            onClose();
        }
        if (clearState !== false) {
            state.anchor = null;
            state.input = null;
            state.onSelect = null;
            state.onClose = null;
        }
    }

    function inputLabel(input) {
        if (!input.value) {
            if (input.type === 'time') return input.getAttribute('placeholder') || '--:--';
            return input.getAttribute('placeholder') || (input.type === 'datetime-local' ? 'Choisir date et heure' : 'Choisir une date');
        }
        if (input.type === 'time') return formatTimeLabel(input.value) || input.value;
        return input.type === 'datetime-local' ? formatDateTimeLabel(input.value) : formatDateLabel(input.value);
    }

    function refreshTrigger(input) {
        const trigger = input && input._dxDateTrigger;
        if (!trigger) return;
        const label = trigger.querySelector('.dx-date-field-trigger-label');
        if (label) label.textContent = inputLabel(input);
        trigger.classList.toggle('is-empty', !input.value);
        trigger.disabled = input.disabled || input.readOnly;
        trigger.setAttribute('aria-label', inputLabel(input));
    }

    function isCompactInput(input) {
        const className = String(input.className || '');
        if (/\blp-input\b/.test(className)) return true;
        const inlineHeight = String(input.getAttribute('style') || '').match(/height\s*:\s*(\d+)px/i);
        if (inlineHeight && Number(inlineHeight[1]) <= 28) return true;
        return false;
    }

    function enhanceInput(input) {
        if (!input || input.matches(IGNORE_SELECTOR) || input.dataset.dxDateEnhanced === '1') return;
        if (input.closest('.dx-date-picker-popover')) return;

        input.dataset.dxDateEnhanced = '1';
        input.classList.add('dx-date-native-hidden');
        input.tabIndex = -1;

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'dx-date-field-trigger' + (isCompactInput(input) ? ' is-compact' : '') + (!input.value ? ' is-empty' : '');
        const icon = input.type === 'time' ? 'solar:clock-circle-linear' : 'solar:calendar-linear';
        trigger.innerHTML = `
            <span class="dx-date-field-trigger-main">
                <iconify-icon icon="${icon}" width="13"></iconify-icon>
                <span class="dx-date-field-trigger-label"></span>
            </span>
            <iconify-icon class="dx-date-field-trigger-caret" icon="tabler:chevron-down" width="13"></iconify-icon>
        `;
        trigger.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            refreshTrigger(input);
            open({
                anchor: trigger,
                input,
                type: input.type,
                value: input.value,
                min: input.min,
                max: input.max
            });
        });
        input.addEventListener('input', () => refreshTrigger(input));
        input.addEventListener('change', () => refreshTrigger(input));
        input.insertAdjacentElement('afterend', trigger);
        input._dxDateTrigger = trigger;
        refreshTrigger(input);
    }

    function enhanceAll(root) {
        const scope = root || document;
        if (!scope.querySelectorAll) return;
        scope.querySelectorAll(INPUT_SELECTOR).forEach(enhanceInput);
        if (scope.matches && scope.matches(INPUT_SELECTOR)) enhanceInput(scope);
    }

    function observe() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes') {
                    refreshTrigger(mutation.target);
                    return;
                }
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) enhanceAll(node);
                });
            });
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'readonly', 'value', 'min', 'max']
        });
    }

    function bindGlobalEvents() {
        const closeOnOutsidePointer = event => {
            const target = event.target;
            const popover = state.popover;
            const anchor = state.anchor;
            if (popover && popover.contains(target)) return;
            if (anchor && anchor.contains && anchor.contains(target)) return;
            if (state.input && state.input._dxDateTrigger && state.input._dxDateTrigger.contains(target)) return;
            close();
        };
        document.addEventListener('pointerdown', closeOnOutsidePointer, true);
        document.addEventListener('click', closeOnOutsidePointer, true);
        window.addEventListener('resize', positionPopover);
        window.addEventListener('scroll', positionPopover, true);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') close();
        });
    }

    function init() {
        enhanceAll(document);
        observe();
        bindGlobalEvents();
    }

    window.DxDatePicker = {
        open,
        close,
        enhanceAll,
        refresh(input) {
            if (input) refreshTrigger(input);
        },
        formatDate: formatDateLabel,
        todayKey
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
