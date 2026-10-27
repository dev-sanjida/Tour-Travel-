/* Booking box on the detail pages (booking-hotel, -cars, -cruise, -flights):
   default dates, steppers, live nights and total, and the Reserve link.
   Load it before js/script.js: the default dates are written while the
   fields are still date inputs, then script.js turns them into the
   v1 date range picker. Does nothing on pages without a .bk box. */
(function () {
  'use strict';

  var boxes = document.querySelectorAll('.bk');
  if (!boxes.length) return;

  var DAY = 86400000;
  var shortDate = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parse(value) { return value ? midnight(new Date(value + 'T00:00')) : null; }
  function money(n) {
    var cents = Math.round(n * 100) % 100 !== 0;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
  }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  boxes.forEach(function (box) {
    var form = box.querySelector('form');
    var fields = Array.prototype.slice.call(box.querySelectorAll('.bk-dates input'));
    var steppers = Array.prototype.slice.call(box.querySelectorAll('.bk-stepper'));
    var factorSelect = box.querySelector('select[data-bk-factor]');
    var selects = Array.prototype.slice.call(box.querySelectorAll('select[name]'));
    var reserve = box.querySelector('.bk-reserve');
    var nightsOut = box.querySelector('[data-bk-nights]');
    var rateOut = box.querySelector('[data-bk-rate]');
    var totalOut = box.querySelector('[data-bk-total]');
    var breakdownOut = box.querySelector('[data-bk-breakdown]');
    var mode = box.getAttribute('data-bk-mode'); // stay | rental | cruise | flight
    var price = parseFloat(box.getAttribute('data-bk-price')) || 0;
    var cruiseNights = parseInt(box.getAttribute('data-bk-length'), 10) || 7;
    var checkout = reserve ? reserve.getAttribute('href').split('?')[0] : '';

    // Default dates: two weeks from today, seven nights.
    var start = addDays(midnight(new Date()), 14);
    [start, addDays(start, 7)].forEach(function (d, i) {
      if (!fields[i]) return;
      fields[i].value = iso(d);
      fields[i].dataset.value = iso(d);
    });

    function count(name) {
      var out = box.querySelector('output[name="' + name + '"]');
      return out ? parseInt(out.value, 10) : 0;
    }

    function setCount(stepper, value) {
      var out = stepper.querySelector('output');
      var min = parseInt(out.getAttribute('data-min'), 10);
      var max = parseInt(out.getAttribute('data-max'), 10);
      value = Math.max(min, Math.min(max, value));
      out.value = value;
      stepper.querySelector('[data-bk-step="-1"]').disabled = value <= min;
      stepper.querySelector('[data-bk-step="1"]').disabled = value >= max;
    }

    steppers.forEach(function (stepper) {
      var out = stepper.querySelector('output');
      setCount(stepper, parseInt(out.value, 10));
      stepper.addEventListener('click', function (event) {
        var button = event.target.closest('[data-bk-step]');
        if (!button || button.disabled) return;
        setCount(stepper, parseInt(out.value, 10) + Number(button.getAttribute('data-bk-step')));
        update();
      });
    });

    // Tablets and phones: a bar fixed to the bottom of the screen with the
    // live total; its button scrolls to this box. Hidden while the box is
    // on screen, and from 992px up (css/style.css, "Responsive fixes").
    var bar = null;
    if (boxes.length === 1) {
      bar = document.createElement('div');
      bar.className = 'bk-bar';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Booking total');
      bar.innerHTML = '<div class="bk-bar__info"><span class="bk-bar__total"></span><span class="bk-bar__note"></span></div>' +
        '<button type="button" class="bk-bar__go">Reserve</button>';
      document.body.appendChild(bar);
      document.body.classList.add('has-bk-bar');
      bar.querySelector('.bk-bar__go').addEventListener('click', function () {
        var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        box.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
        var first = box.querySelector('input:not([type="hidden"]), select, button');
        if (first) first.focus({ preventScroll: true });
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          bar.classList.toggle('is-hidden', entries[0].isIntersecting);
        }, { threshold: 0.15 }).observe(box);
      }
    }

    function show(key, text) {
      document.querySelectorAll('[data-bk-show="' + key + '"]').forEach(function (el) { el.textContent = text; });
    }

    var ready = false;

    function update() {
      var from = fields[0] ? parse(fields[0].dataset.value) : null;
      var to = fields[1] ? parse(fields[1].dataset.value) : null;
      var nights = from && to ? Math.round((to - from) / DAY) : 0;
      var factor = 1;
      if (factorSelect) factor = parseFloat(factorSelect.options[factorSelect.selectedIndex].getAttribute('data-bk-factor')) || 1;
      var travellers = count('adults') + count('children');
      var rate = price * factor;
      var total = 0;
      var valid = true;
      var line = '';
      var breakdown = '';

      if (mode === 'stay') {
        var rooms = count('rooms');
        valid = nights > 0;
        line = valid ? plural(nights, 'night') + ' · ' + shortDate.format(from) + ' – ' + shortDate.format(to) : 'Choose your dates';
        total = rate * nights * rooms;
        breakdown = money(rate) + ' × ' + plural(nights, 'night') + ' × ' + plural(rooms, 'room');
      } else if (mode === 'rental') {
        valid = nights > 0;
        line = valid ? nights + '-day rental' : 'Choose your dates';
        total = rate * nights;
        breakdown = money(rate) + ' × ' + plural(nights, 'day');
      } else if (mode === 'cruise') {
        valid = !!from;
        var back = from ? addDays(from, cruiseNights) : null;
        line = valid ? plural(cruiseNights, 'night') + ' · back on ' + shortDate.format(back) : 'Choose a sailing date';
        rate = Math.round(rate);
        total = rate * travellers;
        breakdown = money(rate) + ' × ' + plural(travellers, 'guest');
        if (from) {
          document.querySelectorAll('[data-bk-day]').forEach(function (el) {
            el.textContent = shortDate.format(addDays(from, parseInt(el.getAttribute('data-bk-day'), 10)));
          });
        }
      } else if (mode === 'flight') {
        valid = !!from;
        var oneWay = from && !to;
        if (oneWay) rate *= 0.6;
        rate = Math.round(rate);
        line = !valid ? 'Choose your dates' : oneWay ? 'One way' : 'Round trip · ' + plural(nights, 'night');
        total = rate * travellers;
        breakdown = money(rate) + ' × ' + plural(travellers, 'traveler');
        show('trip', oneWay ? 'One way' : 'Round trip');
        document.querySelectorAll('[data-bk-leg="return"]').forEach(function (el) { el.hidden = !!oneWay; });
      }

      if (factorSelect) show('cabin', factorSelect.options[factorSelect.selectedIndex].textContent);
      if (from) show('start', shortDate.format(from));
      if (to) show('end', shortDate.format(to));
      if (from) show('range', to ? shortDate.format(from) + ' – ' + shortDate.format(to) : shortDate.format(from));

      if (nightsOut) nightsOut.textContent = line;
      if (rateOut) rateOut.textContent = money(rate);
      if (totalOut) totalOut.value = valid ? money(total) : '–';
      if (breakdownOut) breakdownOut.textContent = valid ? breakdown : 'Pick dates to see the total';

      if (reserve) {
        var query = new URLSearchParams();
        fields.forEach(function (f) { if (f.dataset.value) query.set(f.name, f.dataset.value); });
        selects.forEach(function (s) { query.set(s.name, s.value); });
        steppers.forEach(function (s) { var o = s.querySelector('output'); query.set(o.name, o.value); });
        if (valid) query.set('total', total.toFixed(2));
        reserve.href = checkout + '?' + query.toString();
        reserve.setAttribute('aria-disabled', String(!valid));
      }
      box.classList.toggle('is-incomplete', !valid);

      if (bar) {
        var note = 'Choose your dates';
        if (valid) {
          if (mode === 'stay') note = plural(nights, 'night') + ' · ' + plural(count('adults'), 'adult') + (count('children') ? ', ' + count('children') + (count('children') === 1 ? ' child' : ' children') : '');
          else if (mode === 'rental') note = plural(nights, 'day') + ' rental';
          else if (mode === 'cruise') note = plural(cruiseNights, 'night') + ' · ' + plural(travellers, 'guest');
          else if (mode === 'flight') note = plural(travellers, 'traveler') + ' · ' + (oneWay ? 'one way' : 'round trip');
        }
        bar.querySelector('.bk-bar__total').textContent = valid ? money(total) : '–';
        bar.querySelector('.bk-bar__note').textContent = note;
      }
    }

    box.addEventListener('change', function () { if (ready) update(); });

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (reserve) reserve.click();
      });
    }
    if (reserve) {
      reserve.addEventListener('click', function (event) {
        if (reserve.getAttribute('aria-disabled') !== 'true') return;
        event.preventDefault();
        if (fields[0]) fields[0].click();
      });
    }

    // script.js has run by now: show the default dates the way its picker does.
    document.addEventListener('DOMContentLoaded', function () {
      fields.forEach(function (f) {
        var d = parse(f.dataset.value);
        f.value = d ? shortDate.format(d) : '';
      });
      ready = true;
      if (fields.length) fields[fields.length - 1].dispatchEvent(new Event('change', { bubbles: true }));
      else update();
    });
  });
})();
