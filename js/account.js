/* =====================================================================
   Account pages: sign-in, account, trips, trip, inbox, manage-booking
   and review. Plain JavaScript, loaded after js/script.js. Every part
   checks for its own elements first and does nothing without them.
   Demo only: nothing is sent or saved anywhere.
   ===================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var money = function (n) {
    var sign = n < 0 ? '−' : '';
    return sign + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var say = function (el, text, isError) {
    if (!el) return;
    el.classList.toggle('is-error', !!isError);
    el.textContent = '';
    // A fresh text node after a tick makes screen readers announce repeats too.
    window.setTimeout(function () { el.textContent = text; }, 30);
  };
  var fieldError = function (input, text) {
    var id = input.id && document.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    if (!text) input.removeAttribute('aria-invalid');
    if (id) { id.textContent = text || ''; id.hidden = !text; }
    return !text;
  };
  var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); };
  var statusIn = function (root) { return $('.acc-status', root); };

  /* ---------- Tabs: role="tablist" > role="tab" buttons, panels by id ---------- */
  $$('.acc-tabs[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var select = function (i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panels[n]) panels[n].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
    });
    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select((next + tabs.length) % tabs.length, true);
    });
    // Open a tab from the address, e.g. trips.html#past
    var hash = window.location.hash.replace('#', '');
    var fromHash = tabs.findIndex(function (t) { return t.id === 'tab-' + hash; });
    if (fromHash > -1) select(fromHash, false);
  });

  /* ---------- Show / hide password ---------- */
  $$('.acc-pass__toggle').forEach(function (btn) {
    var input = document.getElementById(btn.getAttribute('aria-controls'));
    if (!input) return;
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.firstElementChild.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
  });

  /* ---------- Password strength ---------- */
  var strength = function (v) {
    if (v.length < 8) return v.length ? 1 : 0;
    var kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(function (r) { return r.test(v); }).length;
    return kinds >= 3 && v.length >= 10 ? 3 : 2;
  };
  var STRENGTH_TEXT = ['At least 8 characters', 'Too short', 'Good', 'Strong'];
  $$('[data-strength]').forEach(function (input) {
    var meter = document.getElementById(input.getAttribute('data-strength'));
    if (!meter) return;
    var text = $('[data-meter-text]', meter);
    input.addEventListener('input', function () {
      var level = strength(input.value);
      meter.setAttribute('data-level', String(level));
      text.textContent = STRENGTH_TEXT[level];
    });
  });

  /* ---------- Reveal panels: a button with aria-expanded opens a form ---------- */
  $$('button[aria-expanded][aria-controls]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel || !panel.classList.contains('acc-reveal')) return;
    var set = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (open) { var f = $('input, select, textarea', panel); if (f) f.focus(); }
    };
    btn.addEventListener('click', function () { set(panel.hidden); });
    $$('[data-close-reveal]', panel).forEach(function (c) {
      c.addEventListener('click', function () { set(false); btn.focus(); });
    });
    panel.accReveal = set;
  });

  /* ---------- Count-down badges: "In 14 days" ---------- */
  $$('[data-countdown]').forEach(function (el) {
    var parts = el.getAttribute('data-countdown').split('-');
    var start = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((start - today) / 86400000);
    if (days > 1) el.textContent = 'In ' + days + ' days';
    else if (days === 1) el.textContent = 'Tomorrow';
    else if (days === 0) el.textContent = 'Today';
    else el.textContent = 'Under way';
  });

  /* =====================================================================
     Sign in
     ===================================================================== */
  var signin = $('#signin-form');
  if (signin) {
    var stepEmail = $('[data-step="email"]', signin);
    var stepPass = $('[data-step="password"]', signin);
    var email = $('#si-email');
    var pass = $('#si-pass');
    var forgot = $('#forgot');
    var forgotBtn = $('[data-forgot]');
    var showStep = function (which) {
      stepEmail.hidden = which !== 'email';
      stepPass.hidden = which !== 'password';
      (which === 'email' ? email : pass).focus();
    };
    signin.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!stepEmail.hidden) {
        if (!fieldError(email, isEmail(email.value) ? '' : 'Enter an email address, like name@example.com.')) { email.focus(); return; }
        $('[data-show-email]', signin).textContent = email.value.trim();
        showStep('password');
        return;
      }
      if (!fieldError(pass, pass.value ? '' : 'Enter your password.')) { pass.focus(); return; }
      window.location.href = signin.getAttribute('action');
    });
    $('[data-step-back]', signin).addEventListener('click', function () { showStep('email'); });

    var setForgot = function (open) {
      forgot.hidden = !open;
      forgotBtn.setAttribute('aria-expanded', String(open));
      signin.hidden = open;
      if (open) $('#fp-email').value = email.value;
      (open ? $('#fp-email') : pass).focus();
    };
    forgotBtn.addEventListener('click', function () { setForgot(true); });
    $('[data-forgot-close]').addEventListener('click', function () { setForgot(false); });
    $('#forgot-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fp = $('#fp-email');
      if (!fieldError(fp, isEmail(fp.value) ? '' : 'Enter the email you signed up with.')) { fp.focus(); return; }
      say(statusIn(this), 'Check your inbox: we sent a reset link to ' + fp.value.trim() + '.');
    });

    $$('[data-social]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        say($('[data-social-status]'), 'Signing you in with ' + btn.getAttribute('data-social') + '…');
        window.setTimeout(function () { window.location.href = 'account.html'; }, 700);
      });
    });
  }

  var create = $('#create-form');
  if (create) {
    create.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      var check = function (input, ok, msg) {
        fieldError(input, ok ? '' : msg);
        if (!ok && !first) first = input;
      };
      check($('#ca-first'), $('#ca-first').value.trim(), 'Enter your first name.');
      check($('#ca-last'), $('#ca-last').value.trim(), 'Enter your last name.');
      check($('#ca-email'), isEmail($('#ca-email').value), 'Enter an email address, like name@example.com.');
      check($('#ca-pass'), $('#ca-pass').value.length >= 8, 'Use at least 8 characters.');
      check($('#ca-terms'), $('#ca-terms').checked, 'Please accept the terms to create an account.');
      if (first) { first.focus(); return; }
      window.location.href = create.getAttribute('action');
    });
  }

  /* =====================================================================
     Account
     ===================================================================== */
  var details = $('#details-form');
  if (details) {
    details.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = ($('#pd-first').value.trim() + ' ' + $('#pd-last').value.trim()).trim();
      if (!name || !isEmail($('#pd-email').value)) {
        say(statusIn(details), 'Please fill in your name and a valid email.', true);
        return;
      }
      $$('[data-profile-name]').forEach(function (el) { el.textContent = name; });
      $$('[data-profile-email]').forEach(function (el) { el.textContent = $('#pd-email').value.trim(); });
      say(statusIn(details), 'Your details are saved.');
    });
  }

  // Remove buttons in any list ("Remove", "Sign out" on a device).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove-row]');
    if (!btn) return;
    var row = btn.closest('.acc-row');
    var card = btn.closest('.acc-card');
    var list = row.parentElement;
    var label = btn.getAttribute('data-remove-row');
    var verb = btn.textContent.trim() === 'Sign out' ? 'Signed out: ' : 'Removed: ';
    var wasDefault = row.querySelector('[data-default-badge]:not([hidden])');
    row.remove();
    if (wasDefault) {
      var next = $('[data-card]', list);
      if (next) setDefaultCard(next);
    }
    say($('[data-list-status]', card), verb + label + '.');
    var focusTo = $('button, a', list) || $('.acc-card__head button', card);
    if (focusTo) focusTo.focus();
  });

  var setDefaultCard = function (row) {
    $$('[data-card]', row.parentElement).forEach(function (r) {
      var on = r === row;
      $('[data-default-badge]', r).hidden = !on;
      $('[data-make-default]', r).hidden = on;
    });
  };
  $$('#card-list').forEach(function (list) {
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-make-default]');
      if (!btn) return;
      var row = btn.closest('[data-card]');
      setDefaultCard(row);
      say($('[data-list-status]', list.closest('.acc-card')), $('b', row).textContent.replace(/\s+/g, ' ') + ' is now your default card.');
      $('[data-remove-row]', row).focus();
    });
  });

  var initials = function (name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join('');
  };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  var removeBtn = function (label, text) {
    var b = el('button', 'acc-link acc-link--danger', text || 'Remove');
    b.type = 'button';
    b.setAttribute('data-remove-row', label);
    return b;
  };

  var travelerForm = $('#traveler-add');
  if (travelerForm) {
    travelerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#tr-name');
      if (!fieldError(name, name.value.trim() ? '' : 'Enter the name as it appears on the passport.')) { name.focus(); return; }
      var full = name.value.trim().replace(/\s+/g, ' ');
      var birth = $('#tr-birth').value;
      var born = birth ? new Date(birth + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      var passport = $('#tr-passport').value.replace(/\s/g, '');
      var row = el('li', 'acc-row');
      var avatar = el('span', 'acc-avatar', initials(full));
      avatar.setAttribute('aria-hidden', 'true');
      var main = el('span', 'acc-row__main');
      main.appendChild(el('b', '', full));
      main.appendChild(el('small', '', [$('#tr-type').value, born && 'Born ' + born, passport && 'Passport ending ' + passport.slice(-4)].filter(Boolean).join(' · ')));
      var actions = el('span', 'acc-row__actions');
      actions.appendChild(removeBtn(full));
      row.appendChild(avatar); row.appendChild(main); row.appendChild(actions);
      $('#traveler-list').appendChild(row);
      travelerForm.reset();
      travelerForm.accReveal(false);
      say($('[data-list-status]', travelerForm.closest('.acc-card')), full + ' is saved and will fill in at checkout.');
    });
  }

  var cardForm = $('#card-add');
  if (cardForm) {
    var num = $('#cd-number');
    num.addEventListener('input', function () {
      var digits = num.value.replace(/\D/g, '').slice(0, 19);
      num.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
    var exp = $('#cd-exp');
    exp.addEventListener('input', function () {
      var d = exp.value.replace(/\D/g, '').slice(0, 4);
      exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    });
    cardForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var digits = num.value.replace(/\D/g, '');
      if (!fieldError(num, digits.length >= 12 ? '' : 'Enter the long number on the front of the card.')) { num.focus(); return; }
      var last4 = digits.slice(-4);
      var kind = /^4/.test(digits) ? ['Visa', 'VISA', ''] : /^5/.test(digits) ? ['Mastercard', 'MC', ' acc-cardmark--teal'] : ['Card', 'CARD', ' acc-cardmark--grey'];
      var row = el('li', 'acc-row');
      row.setAttribute('data-card', '');
      var mark = el('span', 'acc-cardmark' + kind[2], kind[1]);
      mark.setAttribute('aria-hidden', 'true');
      var main = el('span', 'acc-row__main');
      var b = el('b', '', kind[0] + ' ');
      b.appendChild(el('span', 'acc-mono', '•••• ' + last4));
      main.appendChild(b);
      main.appendChild(el('small', '', ($('#cd-name').value.trim() || 'Emily Clarke') + (exp.value ? ' · Expires ' + exp.value : '')));
      var actions = el('span', 'acc-row__actions');
      var badge = el('span', 'acc-badge', 'Default');
      badge.setAttribute('data-default-badge', '');
      badge.hidden = true;
      var make = el('button', 'acc-link', 'Make default');
      make.type = 'button';
      make.setAttribute('data-make-default', '');
      actions.appendChild(badge); actions.appendChild(make); actions.appendChild(removeBtn(kind[0] + ' ending ' + last4));
      row.appendChild(mark); row.appendChild(main); row.appendChild(actions);
      $('#card-list').appendChild(row);
      cardForm.reset();
      $('#cd-name').value = 'Emily Clarke';
      cardForm.accReveal(false);
      say($('[data-list-status]', cardForm.closest('.acc-card')), kind[0] + ' ending ' + last4 + ' is saved.');
    });
  }

  var prefs = $('#prefs-form');
  if (prefs) {
    prefs.addEventListener('submit', function (e) {
      e.preventDefault();
      say(statusIn(prefs), 'Preferences saved. Prices now show in ' + $('#pf-currency').selectedOptions[0].textContent + '.');
    });
  }

  var pw = $('#password-form');
  if (pw) {
    pw.addEventListener('submit', function (e) {
      e.preventDefault();
      var cur = $('#pw-current'), nw = $('#pw-new'), again = $('#pw-again');
      var ok = [
        fieldError(cur, cur.value ? '' : 'Enter your current password.'),
        fieldError(nw, nw.value.length >= 8 ? (nw.value === cur.value ? 'Choose a password you have not used here.' : '') : 'Use at least 8 characters.'),
        fieldError(again, again.value && again.value === nw.value ? '' : 'The two new passwords do not match.')
      ];
      var bad = [cur, nw, again][ok.indexOf(false)];
      if (bad) { bad.focus(); say(statusIn(pw), ''); return; }
      pw.reset();
      $('#pw-meter').setAttribute('data-level', '0');
      $('[data-meter-text]', $('#pw-meter')).textContent = STRENGTH_TEXT[0];
      say(statusIn(pw), 'Password updated. Other devices stay signed in until you sign them out below.');
    });
  }

  var signoutAll = $('[data-signout-all]');
  if (signoutAll) {
    signoutAll.addEventListener('click', function () {
      var rows = $$('#device-list [data-device]');
      rows.forEach(function (r) { r.remove(); });
      signoutAll.disabled = true;
      say($('[data-list-status]', signoutAll.closest('.acc-card')), rows.length ? 'Signed out of ' + rows.length + ' other device' + (rows.length > 1 ? 's' : '') + '.' : 'No other devices are signed in.');
    });
  }

  // Highlight the section in view in the account side menu.
  var accNav = $$('.acc-nav a[href^="#"]');
  if (accNav.length && 'IntersectionObserver' in window) {
    var mark = function (id) {
      accNav.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) mark(en.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    accNav.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('href').slice(1));
      if (sec) seen.observe(sec);
    });
  }

  /* =====================================================================
     Trips
     ===================================================================== */
  var find = $('#find-booking');
  if (find) {
    find.addEventListener('submit', function (e) {
      e.preventDefault();
      var ref = $('#fb-ref').value.trim().toUpperCase();
      var mail = $('#fb-email').value;
      if (!ref || !isEmail(mail)) {
        say(statusIn(find), 'Enter the confirmation number and the email you booked with.', true);
        return;
      }
      if (ref === 'TA-233WE3455' || ref === 'TA-871CR2210') say(statusIn(find), 'That booking is already in your trips above.');
      else say(statusIn(find), 'We could not find ' + ref + '. Check the number in your confirmation email, or message us.', true);
    });
  }

  $$('[data-rate]').forEach(function (group) {
    var stars = $$('.rate__star', group);
    var title = group.closest('.trip-tile').querySelector('.trip-card__title').textContent.trim();
    stars.forEach(function (star, i) {
      star.addEventListener('click', function () {
        stars.forEach(function (s, n) {
          s.classList.toggle('is-on', n <= i);
          s.setAttribute('aria-pressed', String(n === i));
        });
        $('legend', group).textContent = 'Your rating';
        say($('[data-rate-status]'), 'Thanks! You rated ' + title + ' ' + (i + 1) + ' out of 5.');
      });
    });
  });

  /* =====================================================================
     One trip
     ===================================================================== */
  var printBtn = $('[data-print]');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  var noteForm = $('#note-form');
  if (noteForm) {
    noteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#note-text');
      var text = input.value.trim();
      if (!fieldError(input, text ? '' : 'Write a note first.')) { input.focus(); return; }
      var day = document.getElementById($('#note-day').value);
      var item = el('li', 'day-item day-item--note');
      item.appendChild(el('span', 'day-item__time', 'Note'));
      var tile = el('span', 'acc-tile');
      tile.setAttribute('aria-hidden', 'true');
      tile.appendChild(el('i', 'fa-regular fa-note-sticky'));
      item.appendChild(tile);
      var main = el('span', 'day-item__main');
      main.appendChild(el('b', '', 'Your note'));
      main.appendChild(el('small', '', text));
      item.appendChild(main);
      var del = el('button', 'acc-link acc-link--danger', 'Remove');
      del.type = 'button';
      del.addEventListener('click', function () {
        item.remove();
        say($('[data-note-status]'), 'Note removed.');
        input.focus();
      });
      item.appendChild(del);
      $('.day__items', day).appendChild(item);
      input.value = '';
      say($('[data-note-status]'), 'Note added to ' + $('#note-day').selectedOptions[0].textContent + '.');
    });
  }

  $$('[data-send-doc]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      say($('[data-doc-status]'), btn.getAttribute('data-send-doc') + ' sent to emily.clarke@example.com.');
    });
  });

  /* =====================================================================
     Inbox
     ===================================================================== */
  var inbox = $('#inbox');
  if (inbox) {
    var items = $$('.inbox__item', inbox);
    var threads = $$('.convo__thread', inbox);
    var summary = $('[data-unread-summary]');
    var search = $('#inbox-search');
    var filter = 'all';
    var current = 'jynda';

    var unreadOf = function (item) { return +$('.acc-count', item).getAttribute('data-unread'); };
    var setUnread = function (item, n) {
      var c = $('.acc-count', item);
      c.setAttribute('data-unread', String(n));
      c.hidden = n === 0;
      c.firstChild.nodeValue = String(n);
      item.classList.toggle('is-unread', n > 0);
    };
    var updateSummary = function () {
      var total = items.reduce(function (s, it) { return s + unreadOf(it); }, 0);
      summary.textContent = total ? 'You have ' + total + ' unread message' + (total > 1 ? 's' : '') + '.' : 'You are all caught up.';
    };
    var applyFilter = function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var ok = (filter === 'all' || unreadOf(it) > 0) && (!q || it.textContent.toLowerCase().indexOf(q) > -1);
        it.parentElement.hidden = !ok;
        if (ok) shown++;
      });
      $('[data-none]', inbox).hidden = shown > 0;
      $('[data-none]', inbox).textContent = filter === 'unread' && !q ? 'No unread messages.' : 'No conversations match.';
    };
    var scrollDown = function () { var s = $('.convo__scroll', inbox); s.scrollTop = s.scrollHeight; };
    var open = function (id, fromUser) {
      current = id;
      var thread;
      threads.forEach(function (t) {
        var on = t.getAttribute('data-thread') === id;
        t.hidden = !on;
        if (on) thread = t;
      });
      items.forEach(function (it) {
        var on = it.getAttribute('data-thread') === id;
        if (on) it.setAttribute('aria-current', 'true'); else it.removeAttribute('aria-current');
        if (on && fromUser) setUnread(it, 0);
      });
      $('[data-convo-name]', inbox).textContent = thread.getAttribute('data-name');
      $('[data-convo-role]', inbox).textContent = thread.getAttribute('data-role');
      var photo = $('[data-convo-photo]', inbox), ini = $('[data-convo-initials]', inbox);
      if (thread.getAttribute('data-photo')) {
        photo.src = thread.getAttribute('data-photo');
        photo.hidden = false; ini.hidden = true;
      } else {
        ini.textContent = thread.getAttribute('data-initials');
        photo.hidden = true; ini.hidden = false;
      }
      $('[data-convo-trip]', inbox).hidden = !thread.hasAttribute('data-trip');
      updateSummary();
      applyFilter();
      scrollDown();
    };

    items.forEach(function (it) {
      it.addEventListener('click', function () {
        open(it.getAttribute('data-thread'), true);
        inbox.classList.add('is-reading');
        if (window.matchMedia('(max-width: 767px)').matches) $('.convo__back', inbox).focus();
      });
    });
    $('.convo__back', inbox).addEventListener('click', function () {
      inbox.classList.remove('is-reading');
      var it = items.filter(function (i) { return i.getAttribute('data-thread') === current; })[0];
      if (it) it.focus();
    });
    $$('[data-filter]', inbox).forEach(function (b) {
      b.addEventListener('click', function () {
        filter = b.getAttribute('data-filter');
        $$('[data-filter]', inbox).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        applyFilter();
      });
    });
    search.addEventListener('input', applyFilter);

    var REPLIES = {
      jynda: 'Thanks, Emily! I will look into it and get back to you within the hour.',
      hotel: 'Thank you for your message. Our front desk team will reply shortly.',
      atlantica: 'Thanks for writing. An Atlantica agent will answer within 24 hours.',
      bill: 'Got it, Emily. I will let the guide know.',
      george: 'Thanks, I have passed this to our security team.',
      amanda: 'Thank you, Emily. It is always a pleasure to hear from you.'
    };
    var stamp = function () {
      return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };
    var addMsg = function (list, cls, text) {
      var li = el('li', 'msg' + (cls ? ' ' + cls : ''));
      li.appendChild(el('p', '', text));
      li.appendChild(el('small', '', 'Just now, ' + stamp()));
      list.appendChild(li);
      return li;
    };
    $('#convo-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#msg-text');
      var text = input.value.trim();
      if (!text) { input.focus(); return; }
      var thread = threads.filter(function (t) { return t.getAttribute('data-thread') === current; })[0];
      var list = $('.msgs', thread);
      var id = current;
      addMsg(list, 'msg--me', text);
      input.value = '';
      var item = items.filter(function (i) { return i.getAttribute('data-thread') === id; })[0];
      setUnread(item, 0);
      $('.inbox__snippet', item).textContent = 'You: ' + text;
      $('.inbox__time', item).textContent = stamp();
      updateSummary();
      scrollDown();
      var typing = el('li', 'msg msg--typing', thread.getAttribute('data-name') + ' is typing…');
      window.setTimeout(function () { list.appendChild(typing); scrollDown(); }, 500);
      window.setTimeout(function () {
        typing.remove();
        addMsg(list, '', REPLIES[id] || 'Thanks, we will be in touch.');
        $('.inbox__snippet', item).textContent = REPLIES[id];
        scrollDown();
      }, 1800);
    });

    open(current, false);
  }

  /* =====================================================================
     Manage booking
     ===================================================================== */
  var sum = $('[data-sum="total"]');
  var paid = 2508;
  var changes = { dates: 0, extras: 0 };
  var refund = 0;
  var updateSum = function () {
    if (!sum) return;
    var extra = changes.dates + changes.extras;
    var cl = $('[data-sum="changes"]'), rl = $('[data-sum="refund"]');
    cl.hidden = !extra;
    $('dd', cl).textContent = money(extra);
    rl.hidden = !refund;
    $('dd', rl).textContent = money(-refund);
    sum.textContent = money(paid + extra - refund);
  };

  var datesForm = $('#dates-form');
  if (datesForm) {
    var dIn = $('#dt-in'), dOut = $('#dt-out');
    var D = function (k) { return $('[data-d="' + k + '"]', datesForm); };
    var ORIGINAL_IN = '2026-10-30', NIGHTS = 7;
    var parse = function (v) { var p = v.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
    var quote = null;
    var calc = function () {
      quote = null;
      D('submit').disabled = true;
      D('error').hidden = true;
      if (!dIn.value || !dOut.value) return;
      var a = parse(dIn.value), b = parse(dOut.value);
      var nights = Math.round((b - a) / 86400000);
      if (nights < 1) {
        D('error').textContent = 'Check-out must be after check-in.';
        D('error').hidden = false;
        return;
      }
      var shift = Math.round((a - parse(ORIGINAL_IN)) / 86400000);
      var hotel = (nights - NIGHTS) * 150;
      var moved = shift !== 0 || nights !== NIGHTS;
      var fee = moved ? 150 : 0;
      var fare = moved ? Math.abs(shift) * 12 * 2 + Math.abs(nights - NIGHTS) * 8 * 2 : 0;
      var total = hotel + fee + fare;
      D('nights').textContent = nights + ' night' + (nights > 1 ? 's' : '');
      D('hotel').textContent = money(hotel);
      D('fee').textContent = money(fee);
      D('fare').textContent = money(fare);
      D('label').textContent = !moved ? 'No change yet' : total >= 0 ? 'To pay' : 'You get back';
      D('total').textContent = money(Math.abs(total));
      if (moved) { quote = { total: total, a: a, b: b, nights: nights }; D('submit').disabled = false; }
    };
    dIn.addEventListener('change', function () {
      if (dIn.value) {
        var next = parse(dIn.value); next.setDate(next.getDate() + 1);
        dOut.min = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0') + '-' + String(next.getDate()).padStart(2, '0');
      }
      calc();
    });
    dOut.addEventListener('change', calc);
    datesForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!quote) return;
      var fmt = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
      changes.dates = quote.total;
      updateSum();
      var hd = $('[data-hotel-dates]');
      if (hd) hd.textContent = fmt(quote.a) + ' – ' + fmt(quote.b) + ' · ' + quote.nights + ' nights · Deluxe King';
      say(statusIn(datesForm), 'Request sent: ' + fmt(quote.a) + ' to ' + fmt(quote.b) + '. ' + (quote.total >= 0 ? money(quote.total) + ' to pay' : money(-quote.total) + ' back to your card') + '. Demo: nothing is changed.');
    });
  }

  var seatmap = $('#seatmap');
  if (seatmap) {
    var mine = ['32A', '32B'];
    var TAKEN = ['30C', '30D', '31A', '31B', '31E', '32D', '32E', '32F', '33C', '34A', '34B', '34F', '35D', '35E'];
    var bags = 0;
    var seatFor = function () { return +$('input[name="seat-for"]:checked').value; };
    var extrasTotal = function () {
      return mine.filter(function (s) { return s.indexOf('30') === 0; }).length * 45 + bags * 70;
    };
    var showExtras = function () { $('[data-extras-total]').textContent = money(extrasTotal()); };
    var render = function () {
      $$('.seat', seatmap).forEach(function (b) {
        var id = b.getAttribute('data-seat');
        var who = mine.indexOf(id);
        b.setAttribute('aria-pressed', String(who > -1));
        var row = id.slice(0, 2);
        b.setAttribute('aria-label', 'Seat ' + id + (row === '30' ? ', extra legroom, $45' : '') + (TAKEN.indexOf(id) > -1 ? ', taken' : who > -1 ? ', ' + ['Emily', 'James'][who] + '’s seat' : ', free'));
      });
      mine.forEach(function (s, i) { $('[data-seat-of="' + i + '"]').textContent = s; });
      showExtras();
    };
    ['30', '31', '32', '33', '34', '35'].forEach(function (row) {
      seatmap.appendChild(el('span', 'seatmap__label', row));
      'ABCDEF'.split('').forEach(function (col, i) {
        if (i === 3) seatmap.appendChild(el('span', ''));
        var id = row + col;
        var b = el('button', 'seat' + (row === '30' ? ' seat--plus' : ''), col);
        b.type = 'button';
        b.setAttribute('data-seat', id);
        if (TAKEN.indexOf(id) > -1) b.disabled = true;
        seatmap.appendChild(b);
      });
    });
    seatmap.addEventListener('click', function (e) {
      var b = e.target.closest('.seat');
      if (!b || b.disabled) return;
      var id = b.getAttribute('data-seat');
      var i = seatFor();
      var other = mine.indexOf(id);
      if (other > -1 && other !== i) mine[other] = mine[i];
      mine[i] = id;
      render();
      say($('[data-extras-status]'), ['Emily', 'James'][i] + ' now sits in ' + id + '.');
    });
    $$('[data-bags]').forEach(function (b) {
      b.addEventListener('click', function () {
        bags = Math.max(0, Math.min(4, bags + +b.getAttribute('data-bags')));
        $('#bags-count').textContent = String(bags);
        $('[data-bags="-1"]').disabled = bags === 0;
        $('[data-bags="1"]').disabled = bags === 4;
        showExtras();
      });
    });
    $('[data-save-extras]').addEventListener('click', function () {
      changes.extras = extrasTotal();
      updateSum();
      say($('[data-extras-status]'), 'Saved: seats ' + mine.join(' and ') + (bags ? ', ' + bags + ' extra bag' + (bags > 1 ? 's' : '') : '') + '. ' + (changes.extras ? money(changes.extras) + ' added to your trip.' : 'No extra cost.'));
    });
    render();
  }

  var cancelBox = $('#cancel');
  if (cancelBox) {
    var boxes = $$('input[name="cancel"]', cancelBox);
    var start = $('[data-cancel-start]', cancelBox);
    var confirmBox = $('#cancel-confirm');
    var C = function (k) { return $('[data-c="' + k + '"]', cancelBox); };
    var NAMES = { hotel: 'the hotel', flights: 'the flights', car: 'the car' };
    var picked = function () { return boxes.filter(function (b) { return b.checked && !b.disabled; }); };
    var preview = function () {
      var p = picked();
      var paidSel = p.reduce(function (s, b) { return s + +b.getAttribute('data-paid'); }, 0);
      var fee = p.reduce(function (s, b) { return s + +b.getAttribute('data-fee'); }, 0);
      C('paid').textContent = money(paidSel);
      C('fee').textContent = money(fee);
      C('refund').textContent = money(paidSel - fee);
      C('refund2').textContent = money(paidSel - fee);
      var names = p.map(function (b) { return NAMES[b.value]; });
      C('what').textContent = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '';
      start.disabled = !p.length;
      if (!p.length) { confirmBox.hidden = true; start.setAttribute('aria-expanded', 'false'); }
      return paidSel - fee;
    };
    boxes.forEach(function (b) { b.addEventListener('change', preview); });
    start.addEventListener('click', function () {
      confirmBox.hidden = false;
      start.setAttribute('aria-expanded', 'true');
      $('[data-cancel-yes]', confirmBox).focus();
    });
    $('[data-cancel-no]', confirmBox).addEventListener('click', function () {
      confirmBox.hidden = true;
      start.setAttribute('aria-expanded', 'false');
      start.focus();
    });
    $('[data-cancel-yes]', confirmBox).addEventListener('click', function () {
      var p = picked();
      refund += preview();
      p.forEach(function (b) {
        b.checked = false;
        b.disabled = true;
        b.closest('li').classList.add('is-canceled');
        var item = $('.mng-item[data-item="' + b.value + '"]');
        if (item) {
          item.classList.add('is-canceled');
          var badge = $('[data-item-status]', item);
          badge.textContent = 'Canceled';
          badge.classList.add('acc-badge--grey');
        }
      });
      updateSum();
      confirmBox.hidden = true;
      start.setAttribute('aria-expanded', 'false');
      preview();
      say($('[data-cancel-status]'), 'Canceled. ' + money(refund) + ' is on its way back to Visa •••• 4242. Demo: nothing was really canceled.');
      $('#cancel-title').setAttribute('tabindex', '-1');
      $('#cancel-title').focus();
    });
    preview();
  }

  /* =====================================================================
     Review your trip
     ===================================================================== */
  var who = $('#who');
  if (who) {
    var need = +who.getAttribute('data-need');
    var cont = $('[data-continue]');
    var contErr = $('[data-continue-error]');
    var count = function () { return $$('input:checked', who).length; };
    var check = function () {
      var n = count();
      var ok = n === need;
      say($('[data-who-status]'), ok ? n + ' of ' + need + ' adults chosen.' : 'Choose ' + need + ' adults for this room (' + n + ' chosen).', !ok);
      cont.setAttribute('aria-disabled', String(!ok));
      contErr.hidden = ok;
      contErr.textContent = ok ? '' : 'Choose ' + need + ' travelers above to continue.';
      return ok;
    };
    $$('input', who).forEach(function (b) { b.addEventListener('change', check); });
    cont.addEventListener('click', function (e) {
      if (!check()) { e.preventDefault(); $('input:not(:disabled)', who).focus(); }
    });
  }

  var hold = $('[data-hold]');
  if (hold) {
    var left = +hold.getAttribute('data-hold');
    var holdSay = $('[data-hold-say]');
    var tick = window.setInterval(function () {
      left = Math.max(0, left - 1);
      hold.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      if (left && left % 300 === 0) holdSay.textContent = (left / 60) + ' minutes left to book at this price.';
      if (!left) {
        window.clearInterval(tick);
        holdSay.textContent = 'The price hold has ended. The price is still available, we will check it again at checkout.';
      }
    }, 1000);
  }
})();
