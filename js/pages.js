/*----------------------------------------------------*/
/* Travel Agency - explore and reference pages (js/pages.js)
/* destinations.html: search, continent and month filters
/* destination.html:  month bars grow to the average temperature
/* help.html:         search, topics and "was this helpful"
/* Each part does nothing on pages without its elements.
/*----------------------------------------------------*/
(function () {
  'use strict';

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // A row of toggle buttons where one is pressed at a time.
  function chipGroup(buttons, onPick) {
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === button ? 'true' : 'false'); });
        onPick(button);
      });
    });
  }

  function plural(n, word) {
    return n + ' ' + word + (n === 1 ? '' : 's');
  }

  /*----------------------------------------------------*/
  // Destinations: filter the cards
  /*----------------------------------------------------*/
  var grid = document.getElementById('dests');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.dcard'));
    var q = document.getElementById('dest-q');
    var status = document.getElementById('dest-status');
    var empty = document.getElementById('dest-empty');
    var continentChips = Array.prototype.slice.call(document.querySelectorAll('[data-continent]'));
    var monthChips = Array.prototype.slice.call(document.querySelectorAll('[data-month]'));
    var continent = 'all';
    var month = 0;

    var run = function () {
      var text = q.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var good = (' ' + card.getAttribute('data-months') + ' ').indexOf(' ' + month + ' ') > -1;
        var badge = card.querySelector('.dcard__month');
        var ok = (continent === 'all' || card.getAttribute('data-region') === continent) &&
          (!month || good) &&
          (!text || card.textContent.toLowerCase().indexOf(text) > -1);
        card.hidden = !ok;
        badge.hidden = !month;
        if (month) badge.textContent = 'Great in ' + MONTHS[month - 1];
        if (ok) shown++;
      });
      status.textContent = plural(shown, 'destination') + (month ? ' at their best in ' + MONTHS[month - 1] : '');
      empty.hidden = shown > 0;
    };

    q.addEventListener('input', run);
    chipGroup(continentChips, function (chip) { continent = chip.getAttribute('data-continent'); run(); });
    chipGroup(monthChips, function (chip) { month = +chip.getAttribute('data-month'); run(); });

    var reset = document.getElementById('dest-reset');
    if (reset) reset.addEventListener('click', function () {
      q.value = '';
      continent = 'all';
      month = 0;
      continentChips.forEach(function (c, i) { c.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); });
      monthChips.forEach(function (c, i) { c.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); });
      run();
      q.focus();
    });

    // A search sent from another page (404.html?q=...) fills the box.
    var sent = new URLSearchParams(window.location.search).get('q');
    if (sent) q.value = sent;
    run();
  }

  /*----------------------------------------------------*/
  // Destination guide: month bars
  /*----------------------------------------------------*/
  // Each bar's data-temp is the average high in °C; the bars grow to it
  // when they come into view.
  var bars = document.querySelectorAll('.months__bar[data-temp]');
  if (bars.length) {
    var grow = function () {
      bars.forEach(function (bar) {
        bar.style.height = Math.round(14 + +bar.getAttribute('data-temp') * 4.2) + 'px';
      });
    };
    if ('IntersectionObserver' in window) {
      bars.forEach(function (bar) { bar.style.height = '4px'; });
      var watch = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          grow();
          watch.disconnect();
        }
      }, { threshold: 0.3 });
      watch.observe(bars[0].closest('.months'));
    } else {
      grow();
    }
  }

  /*----------------------------------------------------*/
  // Accordions: one answer open at a time within a group
  /*----------------------------------------------------*/
  document.querySelectorAll('[data-accordion]').forEach(function (group) {
    group.addEventListener('toggle', function (event) {
      if (!event.target.open) return;
      group.querySelectorAll('details[open]').forEach(function (d) {
        if (d !== event.target) d.open = false;
      });
    }, true);
  });

  /*----------------------------------------------------*/
  // Help center: search and topics narrow the questions
  /*----------------------------------------------------*/
  var faqs = document.getElementById('faqs');
  if (faqs) {
    var items = Array.prototype.slice.call(faqs.querySelectorAll('.acc'));
    var hq = document.getElementById('help-q');
    var topics = Array.prototype.slice.call(document.querySelectorAll('.topic[data-topic]'));
    var clear = document.getElementById('faq-clear');
    var title = document.getElementById('faq-title');
    var topic = '';

    var filter = function () {
      var text = hq.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var ok = (!topic || item.getAttribute('data-topic') === topic) &&
          (!text || item.textContent.toLowerCase().indexOf(text) > -1);
        item.hidden = !ok;
        if (ok) shown++;
      });
      document.getElementById('faq-empty').hidden = shown > 0;
      document.getElementById('faq-status').textContent = plural(shown, 'answer') + ' shown';
      clear.hidden = !topic && !text;
      var on = topics.filter(function (t) { return t.getAttribute('aria-pressed') === 'true'; })[0];
      title.textContent = on ? on.querySelector('b').textContent : (text ? 'Answers for “' + hq.value.trim() + '”' : 'Popular questions');
    };

    hq.addEventListener('input', filter);
    hq.closest('form').addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
      faqs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.querySelectorAll('[data-ask]').forEach(function (b) {
      b.addEventListener('click', function () {
        hq.value = b.getAttribute('data-ask');
        filter();
        hq.focus();
      });
    });
    topics.forEach(function (button) {
      button.addEventListener('click', function () {
        var on = button.getAttribute('aria-pressed') !== 'true';
        topics.forEach(function (b) { b.setAttribute('aria-pressed', b === button && on ? 'true' : 'false'); });
        topic = on ? button.getAttribute('data-topic') : '';
        filter();
      });
    });
    clear.addEventListener('click', function () {
      topic = '';
      hq.value = '';
      topics.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      filter();
    });
    faqs.addEventListener('click', function (event) {
      var b = event.target.closest('[data-helpful]');
      if (!b) return;
      var box = b.parentElement;
      box.textContent = b.getAttribute('data-helpful') === 'yes' ? 'Thanks for telling us.' : 'Sorry about that. Our team is one click away below.';
    });
  }
})();
