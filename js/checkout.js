/* Checkout pages (booking-*-page.html): the order summary, filled from the
   choices made in the booking box (query string), card number and expiry
   formatting, and form validation with inline errors and an error summary.
   Validation is opt-in: add data-validate to the <form id="co-form"> to check
   the fields before submitting. Without it (the demo), "Complete booking"
   always opens the form's action, booking-success.html.
   Does nothing on pages without a .co block. */
(function () {
  'use strict';

  var co = document.querySelector('.co');
  if (!co) return;

  var DAY = 86400000;
  var shortDate = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  var params = new URLSearchParams(window.location.search);

  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function parse(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? midnight(new Date(value + 'T00:00')) : null;
  }
  function money(n) {
    var cents = Math.round(n * 100) % 100 !== 0;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
  }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function num(key, fallback, min, max) {
    var n = parseInt(params.get(key), 10);
    return isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
  }
  function set(key, text) {
    co.querySelectorAll('[data-co="' + key + '"]').forEach(function (el) {
      if (el.tagName === 'OUTPUT') el.value = text; else el.textContent = text;
    });
  }

  /* ---- Order summary ------------------------------------------------- */
  var mode = co.getAttribute('data-co-mode');
  var price = parseFloat(co.getAttribute('data-co-price')) || 0;
  var defaultStart = addDays(midnight(new Date()), 14);
  var CABINS = {
    cruise: { inside: ['Inside', 1], oceanview: ['Ocean view', 1.2], balcony: ['Balcony', 1.45], suite: ['Suite', 2.1] },
    flight: { economy: ['Economy', 1], premium: ['Premium economy', 1.6], business: ['Business', 3.2], first: ['First', 5] }
  };
  var PLACES = { prg: 'Prague Airport (PRG)', prague: 'Prague city center', brno: 'Brno', vie: 'Vienna Airport (VIE)' };
  var keys = { stay: ['checkin', 'checkout'], rental: ['pickup_date', 'dropoff_date'], cruise: ['sailing', ''], flight: ['depart', 'return'] }[mode] || ['', ''];

  var start = parse(params.get(keys[0]));
  if (!start || start < midnight(new Date())) start = defaultStart;
  var end = keys[1] ? parse(params.get(keys[1])) : null;
  var oneWay = mode === 'flight' && params.has('depart') && !params.get('return');
  if (!oneWay && keys[1] && (!end || end <= start)) end = addDays(start, 7);
  if (oneWay) end = null;

  var adults = num('adults', mode === 'flight' ? 1 : 2, 1, 10);
  var children = num('children', 0, 0, 8);
  var travellers = adults + children;
  var guests = plural(adults, 'adult') + (children ? ', ' + plural(children, 'child').replace('childs', 'children') : '');
  var nights = end ? Math.round((end - start) / DAY) : 0;
  var rate = price;
  var total = 0;
  var rateLine = '';

  set('start', shortDate.format(start));
  if (end) set('end', shortDate.format(end));
  set('range', end ? shortDate.format(start) + ' – ' + shortDate.format(end) : shortDate.format(start));
  set('guests', guests);

  if (mode === 'stay') {
    var rooms = num('rooms', 1, 1, 5);
    total = rate * nights * rooms;
    set('length', plural(nights, 'night'));
    set('guests', guests + ' · ' + plural(rooms, 'room'));
    rateLine = money(rate) + ' × ' + plural(nights, 'night') + (rooms > 1 ? ' × ' + rooms + ' rooms' : '');
  } else if (mode === 'rental') {
    total = rate * nights;
    set('pickup', PLACES[params.get('pickup')] || PLACES.prg);
    set('return', PLACES[params.get('return')] || PLACES[params.get('pickup')] || PLACES.prg);
    set('length', plural(nights, 'day'));
    rateLine = money(rate) + ' × ' + plural(nights, 'day');
  } else {
    var cabin = CABINS[mode][params.get('cabin')] || CABINS[mode][Object.keys(CABINS[mode])[0]];
    rate = Math.round(price * cabin[1] * (oneWay ? 0.6 : 1));
    total = rate * travellers;
    set('cabin', cabin[0]);
    if (mode === 'cruise') set('end', shortDate.format(addDays(start, 7)));
    if (mode === 'flight') {
      set('trip', oneWay ? 'One way' : 'Round trip');
      if (oneWay) set('end', 'One way');
      set('guests', plural(travellers, 'traveler'));
    }
    rateLine = money(rate) + ' × ' + plural(travellers, mode === 'flight' ? 'traveler' : 'guest');
  }
  set('rate-line', rateLine);
  set('subtotal', money(total));
  set('total', money(total));
  set('total-button', ' · ' + money(total));

  /* ---- Form ---------------------------------------------------------- */
  var form = document.getElementById('co-form');
  if (!form) return;
  var errorBox = document.getElementById('co-errors');
  var card = document.getElementById('co-card');
  var expiry = document.getElementById('co-expiry');
  var cvc = document.getElementById('co-cvc');
  var tried = false;

  // Card number in groups of four as it is typed (Amex: 4-6-5).
  if (card) {
    card.addEventListener('input', function () {
      var digits = card.value.replace(/\D/g, '').slice(0, 19);
      var amex = /^3[47]/.test(digits);
      var groups = amex ? [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)] : digits.match(/.{1,4}/g) || [];
      card.value = groups.filter(Boolean).join(' ');
    });
  }
  if (expiry) {
    expiry.addEventListener('input', function (event) {
      var digits = expiry.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length === 1 && digits > '1') digits = '0' + digits;
      var deleting = event.inputType && event.inputType.indexOf('delete') === 0;
      expiry.value = digits.length > 2 || (digits.length === 2 && !deleting) ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    });
  }
  if (cvc) cvc.addEventListener('input', function () { cvc.value = cvc.value.replace(/\D/g, '').slice(0, 4); });

  function labelOf(input) {
    var label = form.querySelector('label[for="' + input.id + '"]');
    return label ? label.firstChild.textContent.trim() : input.name;
  }

  function check(input) {
    var v = input.type === 'checkbox' ? input.checked : input.value.trim();
    var name = labelOf(input).replace(/\s*\(.*\)/, '').toLowerCase();
    if (input.type === 'checkbox') return v ? '' : 'Please accept the booking conditions to continue';
    if (!v) return input.required ? 'Enter your ' + name : '';
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email address like name@example.com';
    if (input.type === 'tel' && v.replace(/\D/g, '').length < 7) return 'Enter a phone number with at least 7 digits';
    if (input.id === 'co-card') {
      var digits = v.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) return 'Card numbers are 13 to 19 digits long';
    }
    if (input.id === 'co-expiry') {
      var m = /^(\d{2})\/(\d{2})$/.exec(v);
      if (!m || +m[1] < 1 || +m[1] > 12) return 'Enter the expiry date as MM/YY';
      var now = new Date();
      if (new Date(2000 + +m[2], +m[1], 1) <= new Date(now.getFullYear(), now.getMonth(), 1)) return 'This card has expired';
    }
    if (input.id === 'co-cvc' && !/^\d{3,4}$/.test(v)) return 'The security code is 3 or 4 digits';
    if (input.id === 'co-dob') {
      var dob = parse(v);
      if (!dob || dob >= midnight(new Date())) return 'Enter a date of birth in the past';
    }
    return '';
  }

  function show(input, message) {
    var error = document.getElementById(input.id + '-error');
    var wrap = input.closest('.co-field, .co-confirm');
    var described = (input.getAttribute('aria-describedby') || '').split(' ').filter(function (id) { return id && id !== input.id + '-error'; });
    if (message) described.push(input.id + '-error');
    if (described.length) input.setAttribute('aria-describedby', described.join(' ')); else input.removeAttribute('aria-describedby');
    input.setAttribute('aria-invalid', String(!!message));
    if (wrap) wrap.classList.toggle('has-error', !!message);
    if (error) { error.textContent = message; error.hidden = !message; }
  }

  var inputs = Array.prototype.slice.call(form.querySelectorAll('.co-input, #co-terms'));
  inputs.forEach(function (input) {
    var recheck = function () { if (!form.hasAttribute('data-validate')) return; if (tried || input.getAttribute('aria-invalid') === 'true') show(input, check(input)); };
    input.addEventListener('blur', recheck);
    input.addEventListener('change', recheck);
    input.addEventListener('input', function () { if (form.hasAttribute('data-validate') && input.getAttribute('aria-invalid') === 'true') show(input, check(input)); });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    // No data-validate on the form: skip the checks and go straight on.
    if (!form.hasAttribute('data-validate')) {
      window.location.href = form.getAttribute('action');
      return;
    }
    tried = true;
    var errors = [];
    inputs.forEach(function (input) {
      var message = check(input);
      show(input, message);
      if (message) errors.push({ input: input, message: message });
    });
    var list = errorBox.querySelector('ul');
    list.innerHTML = '';
    if (!errors.length) {
      errorBox.hidden = true;
      window.location.href = form.getAttribute('action');
      return;
    }
    errors.forEach(function (e) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + e.input.id;
      a.textContent = e.message;
      a.addEventListener('click', function (ev) { ev.preventDefault(); e.input.focus(); });
      li.appendChild(a);
      list.appendChild(li);
    });
    errorBox.querySelector('.co-summary-errors__title').textContent =
      errors.length === 1 ? 'Please fix 1 field' : 'Please fix ' + errors.length + ' fields';
    errorBox.hidden = false;
    errors[0].input.focus();
  });

  /* ---- Steps: Payment becomes the current step while the card form is in use. */
  var steps = co.querySelectorAll('[data-co-step]');
  form.addEventListener('focusin', function (event) {
    var section = event.target.closest('[data-co-section]');
    if (!section) return;
    var current = section.getAttribute('data-co-section');
    steps.forEach(function (step) {
      var on = step.getAttribute('data-co-step') === current;
      step.classList.toggle('is-current', on);
      step.classList.toggle('is-done', current === 'payment' && step.getAttribute('data-co-step') === 'travelers');
      if (on) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
    });
  });
})();
