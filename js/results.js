/*----------------------------------------------------*/
/* Travel Agency - results pages (js/results.js)
/* The filter column ("Clear all", active-filter count) and, on phones,
/* the filters sheet and the folded search summary. On search-deals.html
/* the sidebar trip box applies its choices to the page address; on
/* search-flights.html it filters and sorts the flight cards and fills
/* the summary line from the search box. Load after js/search.js.
/*----------------------------------------------------*/
(function () {
  'use strict';

  const side = document.querySelector('.results-side');
  if (!side) return;
  const panel = side.querySelector('.filters-panel');
  const clears = Array.prototype.slice.call(panel.querySelectorAll('.filters-clear'));
  const toggle = document.querySelector('.filters-toggle');
  const count = toggle && toggle.querySelector('.filters-toggle__count');
  const fields = Array.prototype.slice.call(panel.querySelectorAll('.filters input'));
  const list = document.querySelector('[data-flight-results]');
  const phone = window.matchMedia('(max-width: 991px)'); // the Filters sheet

  function active() {
    return fields.filter(function (f) {
      return (f.type === 'checkbox' || f.type === 'radio') ? f.checked : f.value.trim() !== '';
    }).length;
  }

  // How many results are showing (flight cards, or the cards in the grid).
  function shown() {
    const main = side.parentNode.querySelector('.results-side ~ .col-sm-9');
    if (!main) return 0;
    return Array.prototype.filter.call(main.querySelectorAll('.fr-card, .row .thumbnail'), function (c) { return !c.hidden; }).length;
  }

  /*----------------------------------------------------*/
  // Loading state: the result cards turn into grey skeletons for a moment
  // while results change (first load, filters, sorting). With a real search
  // backend, add .is-loading to the results column when a request starts and
  // remove it when the new cards are in.
  /*----------------------------------------------------*/
  const results = side.parentNode.querySelector('.results-side ~ .col-sm-9');
  let loadingTimer;
  function loading(ms) {
    if (!results || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    results.classList.add('is-loading');
    results.setAttribute('aria-busy', 'true');
    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(function () {
      results.classList.remove('is-loading');
      results.removeAttribute('aria-busy');
    }, ms || 450);
  }
  loading(700);
  if (results) {
    results.addEventListener('change', function (event) { if (event.target.closest('.form3, [data-sort-select]')) loading(); });
    results.addEventListener('click', function (event) { if (event.target.closest('.fr-sort__btn, .results-view button')) loading(); });
  }

  function update(event) {
    if (event) loading();
    const n = active();
    clears.forEach(function (c) { c.disabled = n === 0; });
    if (count) count.textContent = n ? String(n) : '';
    if (list) applyFilters();
    else filterGrid();
    renderChips();
    const total = shown();
    panel.querySelectorAll('[data-results-count]').forEach(function (node) { node.textContent = total; });
  }

  /*----------------------------------------------------*/
  // Card grids. Each card carries its facts as data attributes:
  //   data-f-<name>  the value a filter checks (data-f-type="suv"); several
  //                  values are separated by spaces (data-f-amenity="wifi pool")
  //   data-price, data-rating, data-name, data-nights, data-stops: for sorting
  // A filter list matches "any" ticked value by default. Mark its
  // <ul class="filter-list"> data-match="all" to need every ticked value
  // (amenities), or data-match="min" for "this score or higher" (guest rating).
  // A rating radio (data-rating) sets a minimum, the price boxes a range.
  /*----------------------------------------------------*/
  const main = side.parentNode.querySelector('.results-side ~ .col-sm-9');
  const gridCards = main && !list ? Array.prototype.slice.call(main.querySelectorAll('[data-price]')) : [];
  gridCards.forEach(function (card, i) { card.setAttribute('data-order', i); });
  const line = main && main.querySelector('[data-results-line]');
  const chipsBox = main && main.querySelector('[data-filter-chips]');
  const emptyBox = main && main.querySelector('[data-results-empty]');

  function mode(input) {
    const host = input.closest('[data-match]');
    return host ? host.getAttribute('data-match') : 'any';
  }
  function values(card, name) {
    return (card.getAttribute('data-f-' + name) || '').split(' ').filter(Boolean);
  }
  // Does the card pass one filter group (ticked values of one name)?
  function passGroup(card, name, picked, how) {
    if (!picked.length) return true;
    const own = values(card, name);
    if (how === 'min') {
      const lowest = Math.min.apply(null, picked.map(parseFloat));
      return own.some(function (v) { return parseFloat(v) >= lowest; });
    }
    if (how === 'all') return picked.every(function (v) { return own.indexOf(v) > -1; });
    return picked.some(function (v) { return own.indexOf(v) > -1; });
  }
  function state() {
    const groups = {};
    fields.forEach(function (f) {
      if (f.type !== 'checkbox') return;
      const g = groups[f.name] = groups[f.name] || { picked: [], how: mode(f) };
      if (f.checked) g.picked.push(f.value);
    });
    const min = parseFloat((panel.querySelector('[name="price_min"]') || {}).value) || 0;
    const max = parseFloat((panel.querySelector('[name="price_max"]') || {}).value) || Infinity;
    const rated = panel.querySelector('input[type="radio"]:checked');
    return { groups: groups, min: min, max: max, minRating: rated ? parseFloat(rated.value) : 0 };
  }
  function passes(card, st, skip) {
    const price = parseFloat(card.getAttribute('data-price'));
    if (price < st.min || price > st.max) return false;
    if (parseFloat(card.getAttribute('data-rating') || 5) < st.minRating) return false;
    return Object.keys(st.groups).every(function (name) {
      return name === skip || passGroup(card, name, st.groups[name].picked, st.groups[name].how);
    });
  }

  function filterGrid() {
    if (!gridCards.length) return;
    const st = state();
    let showing = 0;
    gridCards.forEach(function (card) {
      const ok = passes(card, st);
      const cell = card.closest('[class*="col-"]') || card;
      cell.hidden = !ok;
      card.hidden = !ok;
      if (ok) showing++;
    });
    // How many cards each option would show with the other filters as they are.
    fields.forEach(function (f) {
      if (f.type !== 'checkbox' || !st.groups[f.name]) return;
      const g = st.groups[f.name];
      const trial = g.how === 'all' ? g.picked.filter(function (v) { return v !== f.value; }).concat(f.value) : [f.value];
      const n = gridCards.filter(function (card) {
        return passes(card, st, f.name) && passGroup(card, f.name, trial, g.how);
      }).length;
      const label = f.closest('label');
      let badge = label.querySelector('.fchk__count');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'fchk__count';
        label.appendChild(badge);
      }
      badge.textContent = n;
      label.classList.toggle('is-empty', n === 0 && !f.checked);
    });
    main.querySelectorAll('.hl1').forEach(function (l) { l.hidden = showing === 0; });
    panel.querySelectorAll('[data-filters-empty]').forEach(function (p) { p.hidden = showing > 0; });
    if (emptyBox) emptyBox.hidden = showing > 0;
    // Filtered results fit on one page, so the page numbers step aside.
    main.querySelectorAll('.pager_wrapper').forEach(function (pager) { pager.hidden = showing < gridCards.length; });
    if (line) {
      const noun = (line.closest('[data-noun]').getAttribute('data-noun') || 'result|results').split('|');
      const whereSel = line.closest('form').getAttribute('data-where');
      const whereInput = whereSel && document.querySelector('.results-search ' + whereSel + ', ' + whereSel);
      const where = whereInput && whereInput.value.trim() ? ' in ' + whereInput.value.trim().replace(/\s*\([A-Z]{3}\)$/, '') : '';
      const word = function (n) { return n === 1 ? noun[0] : noun[1]; };
      line.textContent = showing === gridCards.length
        ? gridCards.length + ' ' + word(gridCards.length) + where
        : 'Showing ' + showing + ' of ' + gridCards.length + ' ' + noun[1] + where;
    }
    sortGrid();
  }

  /* Sorting: the sort menu (desktop) and the one in the phone results bar stay in step. */
  const sortSelects = main ? Array.prototype.slice.call(main.querySelectorAll('[data-sort-select]')) : [];
  let gridSort = sortSelects.length ? sortSelects[0].value : 'recommended';
  function num2(card, key, fallback) {
    const v = parseFloat(card.getAttribute('data-' + key));
    return isNaN(v) ? fallback : v;
  }
  function sortGrid() {
    if (!gridCards.length) return;
    const row = gridCards[0].closest('.row');
    const by = {
      'price-asc': function (a, b) { return num2(a, 'price', 0) - num2(b, 'price', 0); },
      'price-desc': function (a, b) { return num2(b, 'price', 0) - num2(a, 'price', 0); },
      'rating': function (a, b) { return num2(b, 'rating', 0) - num2(a, 'rating', 0); },
      'stars': function (a, b) { return num2(b, 'f-stars', 0) - num2(a, 'f-stars', 0) || num2(b, 'rating', 0) - num2(a, 'rating', 0); },
      'nights-asc': function (a, b) { return num2(a, 'nights', 0) - num2(b, 'nights', 0); },
      'nights-desc': function (a, b) { return num2(b, 'nights', 0) - num2(a, 'nights', 0); },
      'stops': function (a, b) { return num2(a, 'stops', 0) - num2(b, 'stops', 0) || num2(a, 'price', 0) - num2(b, 'price', 0); },
      'name': function (a, b) { return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || ''); }
    }[gridSort] || function (a, b) { return num2(a, 'order', 0) - num2(b, 'order', 0); };
    gridCards.slice().sort(by).forEach(function (card) {
      row.appendChild(card.closest('[class*="col-"]') || card);
    });
  }
  sortSelects.forEach(function (select) {
    select.addEventListener('change', function () {
      gridSort = select.value;
      sortSelects.forEach(function (other) {
        if (other === select || other.value === gridSort) return;
        other.value = gridSort;
        other.dispatchEvent(new Event('cs:sync'));
      });
      sortGrid();
    });
  });

  /* Chips: one per active filter above the cards, each removes its filter. */
  function chipLabel(f) {
    if (f.name === 'price_min') return 'From $' + f.value;
    if (f.name === 'price_max') return 'Up to $' + f.value;
    const label = f.closest('label');
    const stars = label.querySelector('[aria-label]');
    if (stars) return stars.getAttribute('aria-label');
    const text = label.querySelector('span');
    return (text ? text.textContent : label.textContent).replace(/\s+/g, ' ').trim();
  }
  function renderChips() {
    if (!chipsBox) return;
    const on = fields.filter(function (f) {
      return (f.type === 'checkbox' || f.type === 'radio') ? f.checked : f.value.trim() !== '';
    });
    chipsBox.innerHTML = '';
    on.forEach(function (f) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'results-chip';
      chip.innerHTML = '<span></span><i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      chip.firstChild.textContent = chipLabel(f);
      chip.setAttribute('aria-label', 'Remove filter: ' + chipLabel(f));
      chip.addEventListener('click', function () {
        if (f.type === 'checkbox' || f.type === 'radio') f.checked = false; else f.value = '';
        update(true);
        const next = chipsBox.querySelector('.results-chip') || (main && main.querySelector('[data-sort-select]'));
        if (next) next.focus();
      });
      chipsBox.appendChild(chip);
    });
    if (on.length > 1) {
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'link-btn results-chips__clear';
      all.textContent = 'Clear all';
      all.addEventListener('click', clearAll);
      chipsBox.appendChild(all);
    }
    chipsBox.hidden = on.length === 0;
  }

  function clearAll() {
    fields.forEach(function (f) {
      if (f.type === 'checkbox' || f.type === 'radio') f.checked = false;
      else f.value = '';
    });
    update(true);
  }
  if (emptyBox) emptyBox.querySelectorAll('.filters-clear').forEach(function (b) { b.addEventListener('click', clearAll); });

  panel.addEventListener('input', update);
  panel.addEventListener('change', update);
  clears.forEach(function (c) { c.addEventListener('click', clearAll); });

  /*----------------------------------------------------*/
  // Phones: the filters open as a sheet (a modal dialog)
  /*----------------------------------------------------*/
  const close = panel.querySelector('.filters-sheet__close');
  const showButton = panel.querySelector('.filters-sheet__show');

  function focusables() {
    return Array.prototype.filter.call(panel.querySelectorAll('button, summary, input, select, a[href]'), function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }
  function openSheet() {
    panel.classList.add('is-open');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'filters-sheet-title');
    panel.setAttribute('aria-modal', 'true');
    document.body.classList.add('filters-open');
    toggle.setAttribute('aria-expanded', 'true');
    update();
    close.focus();
  }
  function closeSheet(returnFocus) {
    if (!panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    panel.removeAttribute('role');
    panel.removeAttribute('aria-labelledby');
    panel.removeAttribute('aria-modal');
    document.body.classList.remove('filters-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus !== false) toggle.focus();
  }
  if (toggle && close) {
    toggle.addEventListener('click', openSheet);
    close.addEventListener('click', function () { closeSheet(); });
    if (showButton) showButton.addEventListener('click', function () { closeSheet(); });
    panel.addEventListener('keydown', function (event) {
      if (!panel.classList.contains('is-open')) return;
      if (event.key === 'Escape') { event.preventDefault(); closeSheet(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    // Turning a tablet past 991px closes the sheet.
    phone.addEventListener('change', function () { if (!phone.matches) closeSheet(false); });
  }

  // Below 992px the trip box (search-deals.html) goes to the top of the
  // Filters sheet; from 992px it is back at the top of the sidebar.
  const tripBox = side.querySelector('.trip-card');
  const filterList = panel.querySelector('.ul3.filters');
  if (tripBox && filterList) {
    const tripHome = document.createComment('trip-card');
    tripBox.parentNode.insertBefore(tripHome, tripBox);
    const tripItem = document.createElement('li');
    tripItem.className = 'filters__trip';
    const placeTrip = function () {
      if (phone.matches) {
        if (tripBox.parentNode !== tripItem) tripItem.appendChild(tripBox);
        if (tripItem.parentNode !== filterList) filterList.insertBefore(tripItem, filterList.firstChild);
      } else if (tripBox.parentNode === tripItem) {
        tripHome.parentNode.insertBefore(tripBox, tripHome.nextSibling);
        tripItem.remove();
      }
    };
    placeTrip();
    phone.addEventListener('change', placeTrip);
  }

  /*----------------------------------------------------*/
  // Phones: the search box starts folded into a one-card summary
  /*----------------------------------------------------*/
  const searchWrap = document.querySelector('.results-search');
  const searchForm = searchWrap && searchWrap.querySelector('form');
  if (searchForm) {
    const id = searchForm.id || (searchForm.id = 'results-search-form');
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'search-summary';
    card.setAttribute('aria-controls', id);
    card.setAttribute('aria-expanded', 'false');
    card.innerHTML = '<span class="search-summary__text"><b class="search-summary__place"></b><span class="search-summary__meta"></span></span>' +
      '<span class="search-summary__edit"><i class="fa-solid fa-pen" aria-hidden="true"></i><span class="search-summary__edit-label">Edit</span></span>';
    searchForm.parentNode.insertBefore(card, searchForm);
    const text = function (sel) {
      const node = searchForm.querySelector(sel);
      return node ? node.textContent.trim() : '';
    };
    const cabin = function () {
      const input = searchForm.querySelector('.search__opts input[name="cabin"]');
      return input ? input.parentNode.querySelector('.opt__label').textContent.trim() : '';
    };
    const summarize = function () {
      const places = Array.prototype.map.call(searchForm.querySelectorAll('[data-location]:not([hidden]) input[type="text"], input[data-suggest]'), function (i) { return i.value.trim(); })
        .filter(function (v, n, all) { return v && all.indexOf(v) === n; });
      card.querySelector('.search-summary__place').textContent = places.length ? places.join(' → ') : 'Anywhere';
      const dates = Array.prototype.map.call(searchForm.querySelectorAll('.dp__field'), function (i) { return i.value.trim(); }).filter(Boolean).join(' – ');
      const meta = [text('.sf--dates .sf__value') || dates, text('.sf--trav .sf__value'),
        text('.sf--menu .opt__label') || cabin()].filter(Boolean);
      card.querySelector('.search-summary__meta').textContent = meta.join(' · ');
      card.setAttribute('aria-label', 'Search: ' + card.querySelector('.search-summary__text').textContent);
    };
    // Expanded, the card stays on top as the "Close" control; changes are
    // kept (and shown in the summary) until the next search.
    const setOpen = function (open) {
      searchWrap.classList.toggle('is-collapsed', !open);
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
      card.querySelector('.search-summary__edit i').className = 'fa-solid ' + (open ? 'fa-chevron-up' : 'fa-pen');
      card.querySelector('.search-summary__edit-label').textContent = open ? 'Close' : 'Edit';
    };
    card.addEventListener('click', function () {
      const open = searchWrap.classList.contains('is-collapsed');
      setOpen(open);
    });
    searchForm.addEventListener('sf:change', summarize);
    searchForm.addEventListener('input', summarize);
    searchForm.addEventListener('change', summarize);
    summarize();
    setOpen(false);
  }

  // Flight deals: dates, travelers, trip type and cabin apply as soon as
  // they change; the page address keeps them, so a reload or a shared
  // link shows the same choices.
  if (tripBox && window.history.replaceState) {
    tripBox.addEventListener('sf:change', function () {
      const params = new URLSearchParams(new FormData(tripBox));
      window.history.replaceState(null, '', tripBox.getAttribute('action') + '?' + params.toString());
    });
    tripBox.addEventListener('submit', function (event) { event.preventDefault(); });
    // The submit button is only for browsers without JavaScript.
    const go = tripBox.querySelector('.trip-card__go');
    if (go) go.hidden = true;
  }

  /*----------------------------------------------------*/
  // Flight results (search-flights.html)
  /*----------------------------------------------------*/
  let cards = [];
  let sortBy = 'price';
  const search = document.querySelector('.results-search form');
  const empty = document.querySelector('.fr-empty');
  const sum = {};
  document.querySelectorAll('[data-sum]').forEach(function (node) { sum[node.getAttribute('data-sum')] = node; });

  function money(n) { return '$' + n.toLocaleString('en-US'); }
  function duration(m) { return Math.floor(m / 60) + 'h ' + (m % 60 < 10 ? '0' : '') + (m % 60) + 'm'; }
  function clock(m) { return (Math.floor(m / 60) < 10 ? '0' : '') + Math.floor(m / 60) + ':' + (m % 60 < 10 ? '0' : '') + (m % 60); }
  function num(card, key) { return parseFloat(card.getAttribute('data-' + key)); }
  function field(name) {
    const input = search && search.querySelector('input[type="hidden"][name="' + name + '"]');
    return input ? input.value : '';
  }
  // "Prague (PRG)" -> "PRG"; a city without a code -> its first three letters.
  function code(place) {
    const m = /\(([A-Z]{3})\)/.exec(place);
    return m ? m[1] : place.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  }
  function date(value, withDay) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!m) return '';
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return new Intl.DateTimeFormat('en-US', withDay ? { weekday: 'short', month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric' }).format(d);
  }

  function checked(name) {
    return fields.filter(function (f) { return f.name === name && f.checked; }).map(function (f) { return f.value; });
  }

  function applyFilters() {
    const stops = checked('stops');
    const times = checked('time');
    const airlines = checked('airline');
    const min = parseFloat(panel.querySelector('[name="price_min"]').value);
    const max = parseFloat(panel.querySelector('[name="price_max"]').value);
    let shown = 0;
    cards.forEach(function (card) {
      const price = num(card, 'price');
      const ok = (!stops.length || stops.indexOf(card.getAttribute('data-stops')) > -1) &&
        (!times.length || times.indexOf(card.getAttribute('data-time')) > -1) &&
        (!airlines.length || airlines.indexOf(card.getAttribute('data-airline')) > -1) &&
        (isNaN(min) || price >= min) && (isNaN(max) || price <= max);
      card.hidden = !ok;
      if (ok) shown++;
    });
    if (sum.count) sum.count.textContent = shown + (shown === 1 ? ' flight' : ' flights');
    if (empty) empty.hidden = shown > 0;
    list.hidden = shown === 0;
    notes();
  }

  // Under each sort button: the best value among the cards shown.
  function notes() {
    const visible = cards.filter(function (c) { return !c.hidden; });
    function best(key) {
      return visible.slice().sort(function (a, b) { return num(a, key) - num(b, key); })[0];
    }
    document.querySelectorAll('[data-sort-note]').forEach(function (note) {
      const key = note.getAttribute('data-sort-note');
      const top = best(key);
      if (!top) { note.textContent = '–'; return; }
      note.textContent = key === 'duration' ? duration(num(top, 'duration'))
        : key === 'depart' ? clock(num(top, 'depart'))
        : money(num(top, 'price'));
    });
  }

  function sortCards() {
    cards.slice().sort(function (a, b) { return num(a, sortBy) - num(b, sortBy) || num(a, 'price') - num(b, 'price'); })
      .forEach(function (card) { list.appendChild(card); });
  }

  if (list) {
    cards = Array.prototype.slice.call(list.querySelectorAll('.fr-card'));

    // What was searched: route, dates, travelers and trip type.
    const from = field('from') || 'Prague (PRG)';
    const to = field('to') || 'New York (JFK)';
    const oneway = field('trip') === 'oneway';
    const people = (parseInt(field('adults'), 10) || 1) + (parseInt(field('children'), 10) || 0);
    const depart = date(field('depart'), true);
    const back = oneway ? '' : date(field('return'), true);
    if (sum.route) sum.route.textContent = from + ' → ' + to;
    if (sum.dates) sum.dates.textContent = back ? depart + ' – ' + back : depart;
    if (sum.travelers) sum.travelers.textContent = people + (people === 1 ? ' traveler' : ' travelers');
    list.querySelectorAll('[data-code="from"]').forEach(function (n) { n.textContent = code(from); });
    list.querySelectorAll('[data-code="to"]').forEach(function (n) { n.textContent = code(to); });
    list.querySelectorAll('[data-leg-date="depart"]').forEach(function (n) { n.textContent = depart; });
    list.querySelectorAll('[data-leg-date="return"]').forEach(function (n) { n.textContent = back; });
    list.querySelectorAll('.fr-leg--return').forEach(function (n) { n.hidden = oneway; });
    list.querySelectorAll('[data-total]').forEach(function (n) {
      const each = parseFloat(n.getAttribute('data-total'));
      n.textContent = people > 1 ? money(each * people) + ' total for ' + people + ' travelers' : (oneway ? 'One way' : 'Round trip');
    });

    // The sort tabs and the phone sort menu stay in step.
    const select = document.querySelector('[data-sort-select]');
    const sortTo = function (key) {
      sortBy = key;
      document.querySelectorAll('.fr-sort__btn').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-sort') === key ? 'true' : 'false'); });
      if (select) select.value = key;
      sortCards();
    };
    document.querySelectorAll('.fr-sort__btn').forEach(function (button) {
      button.addEventListener('click', function () { sortTo(button.getAttribute('data-sort')); });
    });
    if (select) select.addEventListener('change', function () { sortTo(select.value); });
    const reset = empty && empty.querySelector('.fr-empty__reset');
    if (reset) reset.addEventListener('click', clearAll);
    sortCards();
  }

  update();
})();
