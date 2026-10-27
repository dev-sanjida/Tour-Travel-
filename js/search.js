/*----------------------------------------------------*/
/* Travel Agency - booking search (js/search.js)
/* The four-tab search box (Flights, Hotels, Cars, Cruises): type-ahead
/* places, a date range calendar, travelers and rooms, and small option
/* menus. No libraries.
/*
/* Each form posts its choices as plain fields (hidden inputs), so the
/* search pages or your booking engine can read them.
/*----------------------------------------------------*/
(function () {
  'use strict';

  /*----------------------------------------------------*/
  // Places offered while typing. Replace or extend with your own.
  // type: city, airport, landmark, region or port.
  /*----------------------------------------------------*/
  const PLACES = [
    { type: 'airport', name: 'Prague', code: 'PRG', airport: 'Václav Havel', sub: 'Czechia', popular: true },
    { type: 'city', name: 'Prague', sub: 'Czechia', popular: true },
    { type: 'airport', name: 'New York', code: 'JFK', airport: 'John F. Kennedy Intl.', sub: 'New York, United States', popular: true },
    { type: 'city', name: 'New York', sub: 'New York, United States' },
    { type: 'airport', name: 'Newark', code: 'EWR', airport: 'Newark Liberty Intl.', sub: 'New Jersey, United States' },
    { type: 'airport', name: 'London', code: 'LHR', airport: 'Heathrow', sub: 'England, United Kingdom', popular: true },
    { type: 'city', name: 'London', sub: 'England, United Kingdom', popular: true },
    { type: 'airport', name: 'Paris', code: 'CDG', airport: 'Charles de Gaulle', sub: 'France' },
    { type: 'city', name: 'Paris', sub: 'Île-de-France, France', popular: true },
    { type: 'airport', name: 'Lisbon', code: 'LIS', airport: 'Humberto Delgado', sub: 'Portugal', popular: true },
    { type: 'city', name: 'Lisbon', sub: 'Portugal' },
    { type: 'airport', name: 'Nassau', code: 'NAS', airport: 'Lynden Pindling Intl.', sub: 'Bahamas', popular: true },
    { type: 'city', name: 'Nassau', sub: 'New Providence, Bahamas' },
    { type: 'airport', name: 'Phoenix', code: 'PHX', airport: 'Sky Harbor Intl.', sub: 'Arizona, United States' },
    { type: 'airport', name: 'Page', code: 'PGA', airport: 'Page Municipal', sub: 'Arizona, United States' },
    { type: 'city', name: 'Page', sub: 'Arizona, United States', popular: true },
    { type: 'city', name: 'Sedona', sub: 'Arizona, United States' },
    { type: 'airport', name: 'Las Vegas', code: 'LAS', airport: 'Harry Reid Intl.', sub: 'Nevada, United States' },
    { type: 'airport', name: 'Los Angeles', code: 'LAX', airport: 'Los Angeles Intl.', sub: 'California, United States' },
    { type: 'airport', name: 'San Francisco', code: 'SFO', airport: 'San Francisco Intl.', sub: 'California, United States' },
    { type: 'airport', name: 'Atlanta', code: 'ATL', airport: 'Hartsfield-Jackson Atlanta Intl.', sub: 'Georgia, United States' },
    { type: 'airport', name: 'Austin', code: 'AUS', airport: 'Austin-Bergstrom Intl.', sub: 'Texas, United States' },
    { type: 'airport', name: 'Miami', code: 'MIA', airport: 'Miami Intl.', sub: 'Florida, United States' },
    { type: 'airport', name: 'Tbilisi', code: 'TBS', airport: 'Tbilisi Intl.', sub: 'Georgia' },
    { type: 'city', name: 'Tbilisi', sub: 'Georgia', popular: true },
    { type: 'airport', name: 'Reykjavík', code: 'KEF', airport: 'Keflavík Intl.', sub: 'Iceland' },
    { type: 'airport', name: 'Rome', code: 'FCO', airport: 'Fiumicino', sub: 'Lazio, Italy' },
    { type: 'city', name: 'Rome', sub: 'Lazio, Italy' },
    { type: 'airport', name: 'Barcelona', code: 'BCN', airport: 'El Prat', sub: 'Catalonia, Spain' },
    { type: 'city', name: 'Barcelona', sub: 'Catalonia, Spain' },
    { type: 'airport', name: 'Athens', code: 'ATH', airport: 'Eleftherios Venizelos', sub: 'Greece' },
    { type: 'city', name: 'Santorini', sub: 'South Aegean, Greece' },
    { type: 'airport', name: 'Tokyo', code: 'HND', airport: 'Haneda', sub: 'Japan' },
    { type: 'city', name: 'Kyoto', sub: 'Japan' },
    { type: 'airport', name: 'Dubai', code: 'DXB', airport: 'Dubai Intl.', sub: 'United Arab Emirates' },
    { type: 'airport', name: 'Cairo', code: 'CAI', airport: 'Cairo Intl.', sub: 'Egypt' },
    { type: 'landmark', name: 'Antelope Canyon', sub: 'Page, Arizona, United States' },
    { type: 'landmark', name: 'Horseshoe Bend', sub: 'Page, Arizona, United States' },
    { type: 'landmark', name: 'Monument Valley', sub: 'Utah, United States', popular: true },
    { type: 'landmark', name: 'Grand Canyon South Rim', sub: 'Arizona, United States' },
    { type: 'landmark', name: 'Eiffel Tower', sub: 'Paris, France' },
    { type: 'landmark', name: 'Colosseum', sub: 'Rome, Italy' },
    { type: 'landmark', name: 'Kazbegi National Park', sub: 'Stepantsminda, Georgia' },
    { type: 'region', name: 'Caribbean', sub: 'Bahamas, Jamaica, Virgin Islands', popular: true },
    { type: 'region', name: 'Mediterranean', sub: 'Spain, France, Italy, Greece', popular: true },
    { type: 'region', name: 'Greek Islands', sub: 'Mykonos, Santorini, Rhodes' },
    { type: 'region', name: 'Norwegian Fjords', sub: 'Geiranger, Flåm, Bergen', popular: true },
    { type: 'region', name: 'Alaska', sub: 'Inside Passage, Glacier Bay' },
    { type: 'region', name: 'Hawaii', sub: 'Oahu, Maui, Big Island' },
    { type: 'port', name: 'Miami', sub: 'Florida, United States' },
    { type: 'port', name: 'Fort Lauderdale', sub: 'Florida, United States' },
    { type: 'port', name: 'Barcelona', sub: 'Spain' },
    { type: 'port', name: 'Copenhagen', sub: 'Denmark' },
    { type: 'port', name: 'Seattle', sub: 'Washington, United States' },
    { type: 'port', name: 'Piraeus', sub: 'Athens, Greece' }
  ];

  const ICONS = { city: 'fa-building', airport: 'fa-plane', landmark: 'fa-location-dot', region: 'fa-earth-americas', port: 'fa-anchor' };

  /*----------------------------------------------------*/
  // Helpers
  /*----------------------------------------------------*/
  const short = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const long = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const compact = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  const phone = window.matchMedia('(max-width: 575.98px)');

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
  function sameDay(a, b) { return !!a && !!b && a.getTime() === b.getTime(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d ? d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) : ''; }
  // Forms marked data-prefill (the search bar on results pages) start from
  // the choices in the page address, e.g. ?where=Lisbon&checkin=2026-10-29.
  const query = new URLSearchParams(window.location.search);
  function prefill(field, name) {
    const form = field.closest('form');
    return form && form.hasAttribute('data-prefill') && name ? query.get(name) : null;
  }
  function parseIso(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function changed(node, detail) { node.dispatchEvent(new CustomEvent('sf:change', { bubbles: true, detail: detail })); }

  /*----------------------------------------------------*/
  // One popover open at a time; Escape or a click outside closes it
  /*----------------------------------------------------*/
  let open = null;

  function openPop(pop, trigger, onClose) {
    if (open && open.pop === pop) return;
    closePop(false);
    pop.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    open = { pop: pop, trigger: trigger, onClose: onClose };
    const sheet = phone.matches && window.getComputedStyle(pop).position === 'fixed';
    document.body.classList.toggle('sf-sheet-open', sheet);
  }

  function closePop(returnFocus) {
    if (!open) return;
    const o = open;
    open = null;
    o.pop.hidden = true;
    o.trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sf-sheet-open');
    if (o.onClose) o.onClose();
    if (returnFocus) o.trigger.focus();
  }

  document.addEventListener('pointerdown', function (event) {
    if (open && !open.pop.contains(event.target) && !open.trigger.contains(event.target)) closePop(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      closePop(true);
    }
  });
  document.addEventListener('focusin', function (event) {
    if (open && !open.pop.contains(event.target) && !open.trigger.contains(event.target)) closePop(false);
  });

  // Header with a close button, shown when a popover opens as a phone sheet.
  function sheetHead(title) {
    const head = el('div', 'sf-pop__head');
    head.appendChild(el('span', '', title));
    const close = el('button', 'sf-pop__close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    close.addEventListener('click', function () { closePop(true); });
    head.appendChild(close);
    return head;
  }

  /*----------------------------------------------------*/
  // Location: type-ahead suggestions (combobox)
  /*----------------------------------------------------*/
  function label(p) {
    if (p.type === 'airport') return p.name + ' (' + p.code + ')';
    if (p.type === 'city' || p.type === 'port') return p.name + ', ' + p.sub;
    return p.name;
  }

  function Location(field) {
    const input = field.querySelector('input[type="text"]');
    const hidden = field.querySelector('input[type="hidden"]');
    const list = field.querySelector('[role="listbox"]');
    const clear = field.querySelector('.sf__clear');
    const kinds = (field.getAttribute('data-kinds') || 'city,airport,landmark').split(',');
    const pool = PLACES.filter(function (p) { return kinds.indexOf(p.type) > -1; });
    let items = [];
    let active = -1;

    function results(query) {
      const q = query.trim().toLowerCase();
      if (!q) return pool.filter(function (p) { return p.popular; }).slice(0, 6);
      const first = [];
      const rest = [];
      pool.forEach(function (p) {
        const name = p.name.toLowerCase();
        const hay = (p.name + ' ' + (p.code || '') + ' ' + (p.airport || '') + ' ' + p.sub).toLowerCase();
        if (name.indexOf(q) === 0 || (p.code && p.code.toLowerCase() === q)) first.push(p);
        else if (hay.indexOf(q) > -1) rest.push(p);
      });
      return first.concat(rest).slice(0, 7);
    }

    // The typed letters are highlighted in each suggestion.
    function mark(text, query) {
      const q = query.trim();
      const b = el('b');
      const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
      if (at < 0) { b.textContent = text; return b; }
      b.appendChild(document.createTextNode(text.slice(0, at)));
      b.appendChild(el('mark', '', text.slice(at, at + q.length)));
      b.appendChild(document.createTextNode(text.slice(at + q.length)));
      return b;
    }

    function render() {
      items = results(input.value);
      active = -1;
      input.removeAttribute('aria-activedescendant');
      list.textContent = '';
      if (!input.value.trim()) list.appendChild(el('li', 'sf-list__title', 'Popular')).setAttribute('role', 'presentation');
      if (!items.length) {
        const none = el('li', 'sf-list__empty', 'No matches. Try a city, airport or landmark.');
        none.setAttribute('role', 'presentation');
        list.appendChild(none);
        return;
      }
      items.forEach(function (p, i) {
        const li = el('li');
        li.id = list.id + '-' + i;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        const icon = el('i', 'fa-solid ' + ICONS[p.type]);
        icon.setAttribute('aria-hidden', 'true');
        const text = el('span');
        // Airports show their code in the name and the airport's full name underneath.
        text.appendChild(mark(p.type === 'airport' ? label(p) : p.name, input.value));
        text.appendChild(el('small', '', p.type === 'airport' ? p.airport + ' · ' + p.sub : p.sub));
        li.append(icon, text);
        li.addEventListener('pointerdown', function (event) { event.preventDefault(); });
        li.addEventListener('click', function () { choose(i); });
        list.appendChild(li);
      });
    }

    function setActive(i) {
      const options = list.querySelectorAll('[role="option"]');
      if (!options.length) return;
      active = (i + options.length) % options.length;
      options.forEach(function (o, n) { o.setAttribute('aria-selected', n === active ? 'true' : 'false'); });
      input.setAttribute('aria-activedescendant', options[active].id);
      options[active].scrollIntoView({ block: 'nearest' });
    }

    function set(value) {
      input.value = value;
      hidden.value = value;
      field.classList.toggle('has-value', !!value);
    }

    function choose(i) {
      set(label(items[i]));
      closePop(false);
      field.classList.remove('is-invalid');
      changed(field, items[i]);
    }

    function show() {
      render();
      openPop(list, input);
    }

    input.addEventListener('focus', show);
    input.addEventListener('click', function () { if (list.hidden) show(); });
    input.addEventListener('input', function () {
      hidden.value = input.value.trim();
      field.classList.toggle('has-value', !!input.value);
      field.classList.remove('is-invalid');
      render();
      if (list.hidden) openPop(list, input);
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (list.hidden) show();
        setActive(active + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Enter' && !list.hidden && active > -1) {
        event.preventDefault();
        choose(active);
      } else if (event.key === 'Tab' && !list.hidden) {
        closePop(false);
      }
    });
    clear.addEventListener('click', function () {
      set('');
      input.focus();
    });

    set(input.value);
    field.location = { get: function () { return input.value.trim(); }, set: set, input: input };
    const given = prefill(field, hidden.name) || input.value;
    if (given) set(given);
  }

  /*----------------------------------------------------*/
  // Dates: two-month calendar, range or single date
  /*----------------------------------------------------*/
  function Dates(field) {
    const button = field.querySelector('.sf__btn');
    const output = field.querySelector('.sf__value');
    const pop = field.querySelector('.sf-cal');
    const startInput = field.querySelector('[data-start]');
    const endInput = field.querySelector('[data-end]');
    const flexInput = field.querySelector('[data-flex]');
    const labels = (field.getAttribute('data-labels') || 'Start,End').split(',');
    const minNights = parseInt(field.getAttribute('data-min-nights'), 10) || 0;
    const flexible = field.hasAttribute('data-flexible');

    const min = today();
    let mode = 'range';
    let start = addDays(min, parseInt(field.getAttribute('data-offset'), 10) || 14);
    let end = addDays(start, parseInt(field.getAttribute('data-length'), 10) || 7);
    let phase = 'start';
    let hover = null;
    let focusDate = start;
    let view = new Date(start.getFullYear(), start.getMonth(), 1);
    let tab = 'calendar';
    const flex = { length: '1 week', months: [] };

    // Build the popover once.
    pop.appendChild(sheetHead(field.getAttribute('data-title') || 'Dates'));
    let tabs;
    if (flexible) {
      tabs = el('div', 'sf-cal__tabs');
      ['Calendar', 'Flexible dates'].forEach(function (name) {
        const b = el('button', '', name);
        b.type = 'button';
        b.setAttribute('aria-pressed', name === 'Calendar' ? 'true' : 'false');
        b.addEventListener('click', function () {
          tab = name === 'Calendar' ? 'calendar' : 'flexible';
          tabs.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          calendar.hidden = tab !== 'calendar';
          flexPanel.hidden = tab !== 'flexible';
          update();
        });
        tabs.appendChild(b);
      });
      pop.appendChild(tabs);
    }

    const calendar = el('div');
    const range = el('div', 'sf-cal__range');
    const startBtn = el('button');
    const endBtn = el('button');
    [startBtn, endBtn].forEach(function (b, i) {
      b.type = 'button';
      b.addEventListener('click', function () {
        phase = i ? 'end' : 'start';
        drawRange();
        focusDay(i && end ? end : start);
      });
    });
    const arrow = el('span', '', '→');
    arrow.setAttribute('aria-hidden', 'true');
    range.append(startBtn, arrow, endBtn);

    const months = el('div', 'sf-cal__months');
    const prev = el('button', 'sf-cal__nav sf-cal__nav--prev');
    const next = el('button', 'sf-cal__nav sf-cal__nav--next');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Previous month');
    next.setAttribute('aria-label', 'Next month');
    prev.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';
    next.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
    prev.addEventListener('click', function () { view.setMonth(view.getMonth() - 1); draw(); });
    next.addEventListener('click', function () { view.setMonth(view.getMonth() + 1); draw(); });
    calendar.append(range, months);
    pop.appendChild(calendar);

    // Flexible dates (stays): how long, and which months.
    const flexPanel = el('div', 'sf-flex');
    flexPanel.hidden = true;
    if (flexible) {
      flexPanel.appendChild(el('h3', '', 'How long would you like to stay?'));
      const lengths = el('div', 'chips');
      ['A weekend', '1 week', '2 weeks', '1 month'].forEach(function (name) {
        const b = el('button', '', name);
        b.type = 'button';
        b.setAttribute('aria-pressed', name === flex.length ? 'true' : 'false');
        b.addEventListener('click', function () {
          flex.length = name;
          lengths.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          update();
        });
        lengths.appendChild(b);
      });
      flexPanel.appendChild(lengths);
      flexPanel.appendChild(el('h3', '', 'When do you want to go?'));
      const monthChips = el('div', 'chips');
      for (let m = 0; m < 6; m++) {
        const d = new Date(min.getFullYear(), min.getMonth() + m, 1);
        (function (date) {
          const b = el('button', '', monthShort.format(date) + (date.getMonth() === 0 || m === 0 ? ' ' + date.getFullYear() : ''));
          b.type = 'button';
          b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () {
            const key = monthShort.format(date);
            const at = flex.months.indexOf(key);
            if (at > -1) flex.months.splice(at, 1); else flex.months.push(key);
            b.setAttribute('aria-pressed', at > -1 ? 'false' : 'true');
            update();
          });
          monthChips.appendChild(b);
        })(d);
      }
      flexPanel.appendChild(monthChips);
      pop.appendChild(flexPanel);
    }

    const foot = el('div', 'sf-cal__foot');
    const hint = el('span', 'sf-cal__hint');
    hint.setAttribute('aria-live', 'polite');
    const done = el('button', 'btn-done', 'Done');
    done.type = 'button';
    done.addEventListener('click', function () {
      if (mode === 'range' && !end) end = addDays(start, Math.max(minNights, 1));
      update();
      closePop(true);
    });
    foot.append(hint, done);
    pop.appendChild(foot);

    function inRange(d) {
      const last = end || (phase === 'end' ? hover : null);
      return mode === 'range' && last && d > start && d < last;
    }

    function drawRange() {
      startBtn.innerHTML = '';
      endBtn.innerHTML = '';
      startBtn.appendChild(el('small', '', labels[0]));
      startBtn.appendChild(document.createTextNode(short.format(start)));
      startBtn.classList.toggle('is-active', phase === 'start' || mode === 'single');
      endBtn.hidden = arrow.hidden = mode === 'single';
      endBtn.appendChild(el('small', '', labels[1]));
      endBtn.appendChild(document.createTextNode(end ? short.format(end) : 'Select'));
      endBtn.classList.toggle('is-active', phase === 'end');
      endBtn.classList.toggle('is-empty', !end);
      hint.textContent = mode === 'single' ? 'Choose a date' : phase === 'start' ? 'Choose ' + labels[0].toLowerCase() + ' date' : 'Choose ' + labels[1].toLowerCase() + ' date';
    }

    function monthGrid(first) {
      const wrap = el('div', 'sf-cal__mon');
      const title = el('p', 'sf-cal__month', monthName.format(first));
      wrap.appendChild(title);
      const grid = el('div', 'sf-cal__grid');
      grid.setAttribute('role', 'group');
      grid.setAttribute('aria-label', monthName.format(first));
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (d) {
        const h = el('span', 'sf-cal__dow', d);
        h.setAttribute('aria-hidden', 'true');
        grid.appendChild(h);
      });
      for (let i = 0; i < first.getDay(); i++) grid.appendChild(el('span'));
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      for (let n = 1; n <= days; n++) {
        const date = new Date(first.getFullYear(), first.getMonth(), n);
        const b = el('button', 'sf-cal__day');
        b.type = 'button';
        b.appendChild(el('span', '', String(n)));
        b.setAttribute('aria-label', long.format(date));
        b.dataset.date = iso(date);
        b.tabIndex = sameDay(date, focusDate) ? 0 : -1;
        if (date < min) b.disabled = true;
        if (sameDay(date, min)) b.classList.add('is-today');
        const isStart = sameDay(date, start);
        const isEnd = mode === 'range' && (sameDay(date, end) || (!end && phase === 'end' && hover && sameDay(date, hover) && hover > start));
        if (isStart) b.classList.add('is-start');
        if (isStart && mode === 'range' && (end || (hover && hover > start && phase === 'end'))) b.classList.add('has-end');
        if (isEnd) b.classList.add('is-end');
        if (inRange(date)) b.classList.add('in-range');
        b.setAttribute('aria-pressed', isStart || (mode === 'range' && sameDay(date, end)) ? 'true' : 'false');
        grid.appendChild(b);
      }
      wrap.appendChild(grid);
      return wrap;
    }

    function draw() {
      months.textContent = '';
      months.append(prev, next);
      months.appendChild(monthGrid(new Date(view)));
      months.appendChild(monthGrid(new Date(view.getFullYear(), view.getMonth() + 1, 1)));
      prev.disabled = view <= new Date(min.getFullYear(), min.getMonth(), 1);
      drawRange();
    }

    function focusDay(date) {
      focusDate = date;
      const shown = new Date(view.getFullYear(), view.getMonth() + (phone.matches ? 1 : 2), 1);
      if (date < view || date >= shown) view = new Date(date.getFullYear(), date.getMonth() - (date >= shown && !phone.matches ? 1 : 0), 1);
      draw();
      const b = months.querySelector('[data-date="' + iso(date) + '"]');
      if (b) b.focus();
    }

    function pick(date) {
      if (mode === 'single') {
        start = date;
      } else if (phase === 'start' || date < start) {
        start = date;
        end = null;
        phase = 'end';
      } else {
        if ((date - start) / 86400000 < minNights) return;
        end = date;
        phase = 'start';
      }
      focusDate = date;
      hover = null;
      draw();
      const b = months.querySelector('[data-date="' + iso(date) + '"]');
      if (b) b.focus();
      update();
    }

    months.addEventListener('click', function (event) {
      const b = event.target.closest('.sf-cal__day');
      if (!b || b.disabled) return;
      pick(new Date(b.dataset.date + 'T00:00:00'));
    });
    months.addEventListener('pointerover', function (event) {
      const b = event.target.closest('.sf-cal__day');
      if (!b || b.disabled || phase !== 'end' || mode !== 'range') return;
      const date = new Date(b.dataset.date + 'T00:00:00');
      if (sameDay(date, hover)) return;
      hover = date;
      months.querySelectorAll('.sf-cal__day').forEach(function (day) {
        const d = new Date(day.dataset.date + 'T00:00:00');
        day.classList.toggle('in-range', inRange(d));
        day.classList.toggle('is-end', hover > start && sameDay(d, hover));
        day.classList.toggle('has-end', sameDay(d, start) && hover > start);
      });
    });
    months.addEventListener('keydown', function (event) {
      const b = event.target.closest('.sf-cal__day');
      if (!b) return;
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
      if (!step) return;
      event.preventDefault();
      const date = addDays(new Date(b.dataset.date + 'T00:00:00'), step);
      if (date < min) return;
      focusDay(date);
    });

    function update() {
      if (tab === 'flexible') {
        output.textContent = flex.length + (flex.months.length ? ' in ' + flex.months.join(', ') : ', any month');
        flexInput.value = output.textContent;
        startInput.value = endInput.value = '';
        return;
      }
      if (flexInput) flexInput.value = '';
      // The bar shows "Oct 29 – Nov 5"; the calendar header keeps the weekdays.
      output.textContent = mode === 'range' ? compact.format(start) + ' – ' + (end ? compact.format(end) : labels[1]) : short.format(start);
      startInput.value = iso(start);
      endInput.value = mode === 'range' ? iso(end) : '';
      changed(field, { start: start, end: end });
    }

    button.addEventListener('click', function () {
      if (!pop.hidden) { closePop(true); return; }
      phase = 'start';
      focusDate = start;
      view = new Date(start.getFullYear(), start.getMonth(), 1);
      draw();
      openPop(pop, button, function () {
        if (mode === 'range' && !end) { end = addDays(start, Math.max(minNights, 1)); update(); }
      });
      const target = tab === 'calendar' ? months.querySelector('.sf-cal__day[tabindex="0"]') : flexPanel.querySelector('button');
      if (target) target.focus();
    });

    const from = parseIso(prefill(field, startInput.name));
    const to = parseIso(prefill(field, endInput && endInput.name));
    if (from && from >= min) {
      start = from;
      end = to && to > from ? to : addDays(from, Math.max(minNights, 1));
    }

    field.dates = {
      setMode: function (m) {
        mode = m;
        if (m === 'single') end = null;
        else if (!end) end = addDays(start, 7);
        phase = 'start';
        update();
      }
    };
    draw();
    update();
  }

  /*----------------------------------------------------*/
  // Travelers (and rooms)
  /*----------------------------------------------------*/
  function Travelers(field) {
    const button = field.querySelector('.sf__btn');
    const output = field.querySelector('.sf__value');
    const pop = field.querySelector('.sf-trav');
    const withRooms = field.hasAttribute('data-rooms');
    const state = { adults: 2, children: 0, rooms: 1 };
    let ages = [];
    const hidden = {};

    ['adults', 'children', 'rooms', 'ages'].forEach(function (name) {
      if (name === 'rooms' && !withRooms) return;
      const input = el('input');
      input.type = 'hidden';
      input.name = name;
      field.appendChild(input);
      hidden[name] = input;
    });

    pop.appendChild(sheetHead(field.getAttribute('data-title') || 'Travelers'));
    const rows = {};
    const limits = { adults: [1, 9], children: [0, 6], rooms: [1, 8] };
    const notes = { adults: 'Ages 18 or above', children: 'Ages 0 to 17', rooms: 'Up to 8 rooms' };
    const names = { adults: 'Adults', children: 'Children', rooms: 'Rooms' };
    const agesBox = el('div', 'sf-trav__ages');

    (withRooms ? ['rooms', 'adults', 'children'] : ['adults', 'children']).forEach(function (key) {
      const row = el('div', 'sf-trav__row');
      const text = el('div');
      text.appendChild(el('b', '', names[key]));
      text.appendChild(el('small', '', notes[key]));
      const stepper = el('div', 'stepper');
      stepper.setAttribute('role', 'group');
      stepper.setAttribute('aria-label', names[key]);
      const minus = el('button');
      const plus = el('button');
      const count = el('output');
      count.setAttribute('aria-live', 'polite');
      minus.type = plus.type = 'button';
      minus.setAttribute('aria-label', 'Fewer ' + names[key].toLowerCase());
      plus.setAttribute('aria-label', 'More ' + names[key].toLowerCase());
      minus.innerHTML = '<i class="fa-solid fa-minus" aria-hidden="true"></i>';
      plus.innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i>';
      minus.addEventListener('click', function () { change(key, -1); });
      plus.addEventListener('click', function () { change(key, 1); });
      stepper.append(minus, count, plus);
      row.append(text, stepper);
      pop.appendChild(row);
      rows[key] = { minus: minus, plus: plus, count: count };
      if (key === 'children') pop.appendChild(agesBox);
    });

    const done = el('button', 'btn-done', 'Done');
    done.type = 'button';
    done.addEventListener('click', function () { closePop(true); });
    pop.appendChild(done);

    function change(key, by) {
      const value = state[key] + by;
      if (value < limits[key][0] || value > limits[key][1]) return;
      if (key === 'rooms' && value > state.adults) return;
      if (key === 'adults' && withRooms && value < state.rooms) return;
      state[key] = value;
      if (key === 'children') {
        if (by > 0) ages.push('');
        else ages.pop();
        drawAges();
      }
      update();
    }

    function drawAges() {
      agesBox.textContent = '';
      ages.forEach(function (age, i) {
        const wrap = el('label', 'field-sm', 'Child ' + (i + 1) + ' age');
        const select = el('select');
        select.appendChild(el('option', '', 'Age'));
        select.firstChild.value = '';
        for (let a = 0; a <= 17; a++) {
          const o = el('option', '', a === 0 ? 'Under 1' : String(a));
          o.value = String(a);
          if (String(a) === age) o.selected = true;
          select.appendChild(o);
        }
        select.addEventListener('change', function () { ages[i] = select.value; update(); });
        wrap.appendChild(select);
        agesBox.appendChild(wrap);
      });
    }

    function update() {
      Object.keys(rows).forEach(function (key) {
        rows[key].count.textContent = state[key];
        rows[key].minus.disabled = state[key] <= limits[key][0] || (key === 'adults' && withRooms && state.adults <= state.rooms);
        rows[key].plus.disabled = state[key] >= limits[key][1] || (key === 'rooms' && state.rooms >= state.adults);
      });
      const people = state.adults + state.children;
      output.textContent = people + (people === 1 ? ' traveler' : ' travelers') +
        (withRooms ? ', ' + state.rooms + (state.rooms === 1 ? ' room' : ' rooms') : '');
      hidden.adults.value = state.adults;
      hidden.children.value = state.children;
      hidden.ages.value = ages.join(',');
      if (hidden.rooms) hidden.rooms.value = state.rooms;
      changed(field, state);
    }

    Object.keys(limits).forEach(function (key) {
      const n = parseInt(prefill(field, hidden[key] && key), 10);
      if (n >= limits[key][0] && n <= limits[key][1]) state[key] = n;
    });
    if (state.children) {
      ages = (prefill(field, 'ages') || '').split(',').slice(0, state.children);
      while (ages.length < state.children) ages.push('');
      drawAges();
    }

    button.addEventListener('click', function () {
      if (!pop.hidden) { closePop(true); return; }
      openPop(pop, button);
      const first = pop.querySelector('.stepper button:not(:disabled)');
      if (first) first.focus();
    });

    update();
  }

  /*----------------------------------------------------*/
  // Option menus (trip type, cabin, times, nights)
  /*----------------------------------------------------*/
  function timeLabel(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return ((h % 12) || 12) + ':' + pad(m) + (h < 12 ? 'am' : 'pm');
  }

  function Menu(wrap) {
    const button = wrap.querySelector('.opt__btn');
    const list = wrap.querySelector('[role="listbox"]');
    const hidden = wrap.querySelector('input[type="hidden"]');
    const text = button.querySelector('.opt__label');
    const prefix = list.getAttribute('data-prefix');

    // Time menus are filled in every 30 minutes.
    if (wrap.hasAttribute('data-times')) {
      const chosen = wrap.getAttribute('data-times');
      for (let t = 0; t < 24 * 60; t += 30) {
        const li = el('li', '', timeLabel(t));
        const value = pad(Math.floor(t / 60)) + ':' + pad(t % 60);
        li.setAttribute('role', 'option');
        li.tabIndex = -1;
        li.dataset.value = value;
        li.setAttribute('aria-selected', value === chosen ? 'true' : 'false');
        list.appendChild(li);
      }
    }
    const options = Array.prototype.slice.call(list.querySelectorAll('[role="option"]'));
    // On a results page the menu shows the choice it was searched with.
    const given = prefill(wrap, hidden.name);
    const match = given && options.filter(function (o) { return o.dataset.value === given; })[0];
    if (match) {
      options.forEach(function (o) { o.setAttribute('aria-selected', o === match ? 'true' : 'false'); });
      hidden.value = given;
      text.textContent = match.textContent;
    }
    if (prefix) {
      const first = list.querySelector('[aria-selected="true"]');
      text.textContent = '';
      text.appendChild(el('small', '', prefix));
      text.appendChild(document.createTextNode(first ? first.textContent : ''));
    }

    function select(option) {
      options.forEach(function (o) { o.setAttribute('aria-selected', o === option ? 'true' : 'false'); });
      hidden.value = option.dataset.value;
      text.textContent = '';
      if (prefix) text.appendChild(el('small', '', prefix));
      text.appendChild(document.createTextNode(option.textContent));
      closePop(true);
      changed(wrap, option.dataset.value);
    }

    button.addEventListener('click', function () {
      if (!list.hidden) { closePop(true); return; }
      openPop(list, button);
      const current = list.querySelector('[aria-selected="true"]') || options[0];
      current.focus();
      current.scrollIntoView({ block: 'nearest' });
    });
    button.addEventListener('keydown', function (event) {
      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && list.hidden) {
        event.preventDefault();
        button.click();
      }
    });
    list.addEventListener('click', function (event) {
      const o = event.target.closest('[role="option"]');
      if (o) select(o);
    });
    list.addEventListener('keydown', function (event) {
      const at = options.indexOf(document.activeElement);
      const to = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: options.length - 1 }[event.key];
      if (to !== undefined) {
        event.preventDefault();
        options[Math.max(0, Math.min(options.length - 1, to))].focus();
      } else if ((event.key === 'Enter' || event.key === ' ') && at > -1) {
        event.preventDefault();
        select(options[at]);
      } else if (event.key === 'Tab') {
        closePop(false);
      }
    });
  }

  // Small panel with fields (discount code).
  function Panel(wrap) {
    const button = wrap.querySelector('.opt__btn');
    const pop = wrap.querySelector('.sf-pop');
    const text = button.querySelector('.opt__label');
    button.addEventListener('click', function () {
      if (!pop.hidden) { closePop(true); return; }
      openPop(pop, button, function () {
        const code = pop.querySelector('input[name="code"]').value.trim();
        text.textContent = code ? 'Code: ' + code : 'Discount codes';
      });
      pop.querySelector('select, input').focus();
    });
    pop.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { closePop(true); });
    });
    pop.querySelector('[data-clear]').addEventListener('click', function () {
      pop.querySelectorAll('select, input').forEach(function (f) { f.value = ''; });
    });
  }

  /*----------------------------------------------------*/
  // Wire everything up
  /*----------------------------------------------------*/
  document.querySelectorAll('[data-location]').forEach(Location);
  document.querySelectorAll('[data-dates]').forEach(Dates);
  document.querySelectorAll('[data-travelers]').forEach(Travelers);
  document.querySelectorAll('[data-menu]').forEach(Menu);
  document.querySelectorAll('[data-panel]').forEach(Panel);

  // Flights: one-way uses a single date; the swap button exchanges places.
  document.querySelectorAll('[data-role="trip"]').forEach(function (menu) {
    menu.addEventListener('sf:change', function (event) {
      const dates = menu.closest('form').querySelector('[data-dates]');
      dates.dates.setMode(event.detail === 'oneway' ? 'single' : 'range');
    });
    if (menu.querySelector('input[type="hidden"]').value === 'oneway') {
      menu.closest('form').querySelector('[data-dates]').dates.setMode('single');
    }
  });

  // Results pages: tick the extra options that were part of the search.
  document.querySelectorAll('form[data-prefill] .search__extra input[type="checkbox"]').forEach(function (box) {
    box.checked = query.get(box.name) === box.value;
  });
  document.querySelectorAll('.sbar__swap').forEach(function (swap) {
    swap.addEventListener('click', function () {
      const places = swap.closest('.sbar').querySelectorAll('[data-location]');
      const a = places[0].location.get();
      places[0].location.set(places[1].location.get());
      places[1].location.set(a);
    });
  });

  // Cars: a different drop-off location adds a second place field.
  const otherDropoff = document.getElementById('car-other-dropoff');
  if (otherDropoff) {
    document.getElementById('car-dropoff-field').hidden = !otherDropoff.checked;
    otherDropoff.addEventListener('change', function () {
      const field = document.getElementById('car-dropoff-field');
      field.hidden = !otherDropoff.checked;
      if (otherDropoff.checked) field.location.input.focus();
      else field.location.set('');
    });
  }

  // Required places: say what's missing instead of submitting.
  document.querySelectorAll('form[data-search]').forEach(function (form) {
    const error = form.querySelector('.search__error');
    form.addEventListener('submit', function (event) {
      const missing = Array.prototype.slice.call(form.querySelectorAll('[data-location][data-required]'))
        .filter(function (f) { return !f.hidden && !f.location.get(); })[0];
      if (!missing) { error.textContent = ''; return; }
      event.preventDefault();
      missing.classList.add('is-invalid');
      error.textContent = missing.getAttribute('data-required');
      missing.location.input.focus();
    });
    form.addEventListener('sf:change', function () { error.textContent = ''; });
  });
})();
