/*----------------------------------------------------*/
/* Travel Agency - site scripts
/* Requires Bootstrap 5 (bundle) and Swiper, both loaded before this file.
/*----------------------------------------------------*/
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // True on devices with a mouse. Touch devices skip the scroll-linked
  // parallax, as they did before.
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /*----------------------------------------------------*/
  // Menu (was Superfish)
  /*----------------------------------------------------*/
  // Submenus open on hover and keyboard focus (see css/style.css). The parent
  // items link to "#", so a click or tap toggles their submenu instead.
  var subMenus = document.querySelectorAll('.navbar_ .sub-menu');

  var closeSubMenus = function (except) {
    subMenus.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      var toggle = item.querySelector(':scope > a');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  };

  subMenus.forEach(function (item) {
    var toggle = item.querySelector(':scope > a[href="#"]');
    if (!toggle) return;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      var open = !item.classList.contains('is-open');
      closeSubMenus(item);
      item.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.navbar_ .sub-menu')) closeSubMenus();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var open = document.querySelector('.navbar_ .sub-menu.is-open');
    if (!open) return;
    closeSubMenus();
    var toggle = open.querySelector(':scope > a');
    if (toggle) toggle.focus();
  });

  /*----------------------------------------------------*/
  // Carousels (was carouFredSel)
  /*----------------------------------------------------*/
  // carouFredSel showed ceil(width / itemWidth) items, clamped to [min, max].
  // The same rule as Swiper breakpoints, measured on the carousel's own width.
  function carouselBreakpoints(itemWidth, min, max) {
    var points = {};
    for (var n = min; n <= max; n++) {
      points[n === min ? 0 : (n - 1) * itemWidth + 1] = { slidesPerView: n, slidesPerGroup: 1 };
    }
    return points;
  }

  // Pagination dots keep the template's own markup: a button per slide, the
  // current one marked with the "selected" class.
  function dots(el, label) {
    return {
      el: el,
      clickable: true,
      bulletElement: 'button',
      bulletClass: 'carousel-dot',
      bulletActiveClass: 'selected',
      renderBullet: function (index, className) {
        return '<button type="button" class="' + className + '" aria-label="' + label + ' ' + (index + 1) + '"></button>';
      }
    };
  }

  // Slides inside a <ul> are announced as list items, so the list stays a list.
  function a11yFor(el) {
    var wrapper = el.querySelector('.swiper-wrapper');
    return { enabled: true, slideRole: wrapper && wrapper.tagName === 'UL' ? 'listitem' : 'group' };
  }

  function carousel(root, itemWidth, min, max, extra) {
    root = typeof root === 'string' ? document.querySelector(root) : root;
    if (!root || !window.Swiper) return;
    var el = root.querySelector('.carousel.main');
    if (!el) return;
    var options = {
      speed: 1000,
      loop: true,
      grabCursor: true,
      autoplay: reduceMotion ? false : { delay: 8000, disableOnInteraction: false, pauseOnMouseEnter: true },
      breakpointsBase: 'container',
      breakpoints: carouselBreakpoints(itemWidth, min, max),
      a11y: a11yFor(el)
    };
    for (var key in extra) options[key] = extra[key];
    new window.Swiper(el, options);
  }

  // Home: welcome text (a slider only when there is more than one slide).
  if (document.querySelectorAll('#slider .swiper-slide').length > 1) carousel('#slider', 1000, 1, 1, {
    autoHeight: true,
    pagination: dots(document.querySelector('.slider_pagination'), 'Show slide')
  });

  // Home: popular cruises.
  carousel('#popular', 520, 1, 3, {
    pagination: dots(document.querySelector('.popular_pagination'), 'Show cruise')
  });

  // Sidebar testimonials (sm_slider1 .. sm_slider4).
  document.querySelectorAll('.sm_slider').forEach(function (slider) {
    carousel(slider, 1000, 1, 1, {
      autoHeight: true,
      navigation: {
        prevEl: slider.querySelector('.sm_slider_prev'),
        nextEl: slider.querySelector('.sm_slider_next')
      }
    });
  });

  // Blog and booking: photo slider.
  // Photo sliders with a single photo: no arrows, no dots, no swiping.
  document.querySelectorAll('#sl1').forEach(function (root) {
    if (root.querySelectorAll('.swiper-slide').length < 2) root.classList.add('is-single');
  });
  if (!document.querySelector('#sl1.is-single')) carousel('#sl1', 2000, 1, 1, {
    navigation: { prevEl: '#sl1 .sl1_prev', nextEl: '#sl1 .sl1_next' },
    pagination: dots(document.querySelector('#sl1 .sl1_pagination'), 'Show photo')
  });

  /*----------------------------------------------------*/
  // Hero slideshow on index-2.html (was Superslides)
  /*----------------------------------------------------*/
  if (document.querySelector('#slides') && window.Swiper) {
    new window.Swiper('#slides', {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 1000,
      loop: true,
      autoplay: reduceMotion ? false : { delay: 7000, disableOnInteraction: false },
      a11y: a11yFor(document.querySelector('#slides')),
      pagination: dots(document.querySelector('#slides .slides-pagination'), 'Show slide')
    });
  }

  /*----------------------------------------------------*/
  // Tabs (was jQuery UI Tabs)
  /*----------------------------------------------------*/
  // Markup: a list of links to panel ids, and the panels. The list item with
  // the "active" class is the tab shown first.
  document.querySelectorAll('.tabs1, .tabs2, .tabs3').forEach(function (tabs, tabsIndex) {
    var list = tabs.querySelector('.tabs_tabs ul, .tabs3_tabs ul');
    if (!list) return;
    var links = Array.prototype.slice.call(list.querySelectorAll('a[href^="#"]'));
    var panels = links.map(function (link) {
      return tabs.querySelector(link.getAttribute('href'));
    });

    list.setAttribute('role', 'tablist');
    links.forEach(function (link, i) {
      var panel = panels[i];
      if (!panel) return;
      link.parentElement.setAttribute('role', 'presentation');
      link.setAttribute('role', 'tab');
      link.id = link.id || 'tab-' + tabsIndex + '-' + i;
      link.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', link.id);
    });

    var select = function (index, focus) {
      links.forEach(function (link, i) {
        var active = i === index;
        link.parentElement.classList.toggle('active', active);
        link.setAttribute('aria-selected', active ? 'true' : 'false');
        link.tabIndex = active ? 0 : -1;
        if (panels[i]) panels[i].hidden = !active;
      });
      if (focus) links[index].focus();
      // Carousels inside a panel that was hidden measure themselves again.
      window.dispatchEvent(new Event('resize'));
    };

    var first = links.findIndex(function (link) {
      return link.parentElement.classList.contains('active');
    });
    select(first < 0 ? 0 : first, false);

    list.addEventListener('click', function (event) {
      var link = event.target.closest('a[role="tab"]');
      if (!link) return;
      event.preventDefault();
      select(links.indexOf(link), false);
    });

    list.addEventListener('keydown', function (event) {
      var current = links.indexOf(document.activeElement);
      if (current < 0) return;
      var next = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: links.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select((next + links.length) % links.length, true);
    });
  });

  /*----------------------------------------------------*/
  // Parallax (was jQuery Parallax 1.1.3)
  /*----------------------------------------------------*/
  var parallaxBgs = document.querySelectorAll('.parallax .bg1, .parallax .bg2');
  if (parallaxBgs.length && finePointer && !reduceMotion) {
    var speedFactor = 0.5;
    var ticking = false;

    var updateParallax = function () {
      var scrollTop = window.scrollY;
      var viewport = window.innerHeight;
      parallaxBgs.forEach(function (bg) {
        var rect = bg.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) return;
        var firstTop = rect.top + scrollTop;
        bg.style.backgroundPosition = '50% ' + Math.round((firstTop - scrollTop) * speedFactor) + 'px';
      });
      ticking = false;
    };

    var requestParallax = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateParallax);
      }
    };

    parallaxBgs.forEach(function (bg) { bg.classList.add('bg-fixed'); });
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    updateParallax();
  }

  /*----------------------------------------------------*/
  // Reveal on scroll (was jQuery Appear) + Animate.css 4
  /*----------------------------------------------------*/
  function whenVisible(selector, callback) {
    var items = document.querySelectorAll(selector);
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(callback);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        callback(entry.target);
      });
    });
    items.forEach(function (item) { observer.observe(item); });
  }

  whenVisible('.animated', function (el) {
    var animation = el.getAttribute('data-animation');
    var delay = parseInt(el.getAttribute('data-animation-delay'), 10) || 0;
    var reveal = function () {
      if (animation && !reduceMotion) {
        el.classList.add('animate__animated', 'animate__' + animation);
      }
      el.classList.add('visible');
    };
    if (delay && !reduceMotion) {
      window.setTimeout(reveal, delay);
    } else {
      reveal();
    }
  });

  /*----------------------------------------------------*/
  // Progress bars (was jQuery .animate)
  /*----------------------------------------------------*/
  whenVisible('.animated-distance', function (el) {
    var target = parseFloat(el.getAttribute('data-num')) || 0;
    var duration = parseInt(el.getAttribute('data-duration'), 10) || 1000;
    var delay = parseInt(el.getAttribute('data-animation-delay'), 10) || 0;
    var label = el.querySelector('span');
    var draw = function (value) {
      var text = Math.round(value) + '%';
      el.style.width = text;
      if (label) label.textContent = text;
    };

    if (reduceMotion) {
      draw(target);
      return;
    }
    draw(0);
    window.setTimeout(function () {
      var start = null;
      var step = function (now) {
        if (start === null) start = now;
        var progress = Math.min((now - start) / duration, 1);
        // jQuery's default "swing" easing, which the bars used before.
        draw(target * (0.5 - Math.cos(progress * Math.PI) / 2));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }, delay);
  });

  /*----------------------------------------------------*/
  // Gallery filter and layout (was Isotope)
  /*----------------------------------------------------*/
  var grid = document.getElementById('isotope-items');
  if (grid) {
    var tiles = Array.prototype.slice.call(grid.querySelectorAll('.element'));
    var desktop = window.matchMedia('(min-width: 992px)');

    // Masonry, as Isotope did it: the grid has three columns; each tile
    // (one, two or three columns wide) goes where its columns are least
    // filled, and pushes those columns down by its height.
    var layout = function () {
      if (!desktop.matches) {
        grid.classList.remove('is-laid-out');
        grid.style.height = '';
        tiles.forEach(function (tile) { tile.style.transform = ''; tile.style.width = ''; });
        return;
      }
      grid.classList.add('is-laid-out');
      var columnWidth = grid.clientWidth / 3;
      var heights = [0, 0, 0];
      tiles.forEach(function (tile) {
        if (tile.hidden) return;
        var span = tile.classList.contains('col-sm-12') ? 3 : tile.classList.contains('col-sm-8') ? 2 : 1;
        tile.style.width = columnWidth * span + 'px';
        var best = 0;
        var bestTop = Infinity;
        for (var col = 0; col + span <= 3; col++) {
          var top = Math.max.apply(null, heights.slice(col, col + span));
          if (top < bestTop) { bestTop = top; best = col; }
        }
        tile.style.transform = 'translate(' + best * columnWidth + 'px, ' + bestTop + 'px)';
        // Exact (sub-pixel) heights, as Isotope measured them.
        var bottom = bestTop + tile.getBoundingClientRect().height;
        for (var c = best; c < best + span; c++) heights[c] = bottom;
      });
      grid.style.height = Math.max.apply(null, heights) + 'px';
    };

    grid.querySelectorAll('img').forEach(function (img) {
      if (!img.complete) img.addEventListener('load', layout);
    });
    window.addEventListener('resize', layout);
    layout();

    var filters = document.getElementById('filters');
    if (filters) {
      filters.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-filter]');
        if (!button) return;
        var filter = button.getAttribute('data-filter');
        filters.querySelectorAll('button[data-filter]').forEach(function (b) {
          var selected = b === button;
          b.classList.toggle('selected', selected);
          b.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        tiles.forEach(function (tile) {
          tile.hidden = filter !== '*' && !tile.matches(filter);
        });
        layout();
      });
    }
  }

  /*----------------------------------------------------*/
  // Lightbox (was touchTouch)
  /*----------------------------------------------------*/
  var galleryLinks = Array.prototype.slice.call(document.querySelectorAll('.thumb-isotope .thumbnail a'));
  if (galleryLinks.length && window.HTMLDialogElement) {
    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Photo viewer');
    dialog.innerHTML =
      '<figure class="lightbox__figure"><img alt=""><figcaption class="lightbox__caption"></figcaption></figure>' +
      '<button type="button" class="lightbox__button lightbox__prev" aria-label="Previous photo"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
      '<button type="button" class="lightbox__button lightbox__next" aria-label="Next photo"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>' +
      '<button type="button" class="lightbox__button lightbox__close" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
    document.body.appendChild(dialog);

    var image = dialog.querySelector('img');
    var caption = dialog.querySelector('figcaption');
    var current = 0;

    // Only photos the gallery filter is showing.
    var visibleLinks = function () {
      return galleryLinks.filter(function (link) {
        var tile = link.closest('.element');
        return !tile || !tile.hidden;
      });
    };

    var show = function (link) {
      var text = link.querySelector('.caption');
      var thumb = link.querySelector('img');
      image.src = link.getAttribute('href');
      image.alt = thumb ? thumb.alt : '';
      caption.textContent = text ? text.textContent.replace(/\s+/g, ' ').trim() : '';
    };

    var step = function (by) {
      var links = visibleLinks();
      current = (links.indexOf(galleryLinks[current]) + by + links.length) % links.length;
      current = galleryLinks.indexOf(links[current]);
      show(galleryLinks[current]);
    };

    galleryLinks.forEach(function (link, i) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        current = i;
        show(link);
        dialog.showModal();
      });
    });

    dialog.querySelector('.lightbox__prev').addEventListener('click', function () { step(-1); });
    dialog.querySelector('.lightbox__next').addEventListener('click', function () { step(1); });
    dialog.querySelector('.lightbox__close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    });
  }

  /*----------------------------------------------------*/
  // Month fields (cruise dates): a list of the next 18 months instead of
  // the browser's month input, so they look like the other fields.
  /*----------------------------------------------------*/
  var monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  document.querySelectorAll('.input1_inner input[type="month"]').forEach(function (input) {
    var select = document.createElement('select');
    select.className = 'select';
    select.name = input.name || '';
    var any = document.createElement('option');
    any.value = '';
    any.textContent = 'Any month';
    select.appendChild(any);
    var d = new Date();
    for (var m = 0; m < 18; m++) {
      var month = new Date(d.getFullYear(), d.getMonth() + m, 1);
      var o = document.createElement('option');
      o.value = month.getFullYear() + '-' + String(month.getMonth() + 1).padStart(2, '0');
      o.textContent = monthLabel.format(month);
      select.appendChild(o);
    }
    var box = input.parentElement;
    box.classList.remove('input1_inner');
    box.classList.add('select1_inner');
    input.replaceWith(select);
  });

  /*----------------------------------------------------*/
  // Search fields: an icon inside each field (place, date, people), as in
  // the new design, and a button that swaps "Flying from" and "To".
  /*----------------------------------------------------*/
  var FIELD_ICONS = [
    [/^(flying from|to|sail to|sail from|city or hotel|country|city|location|pick up|drop off|destination)/i, 'fa-location-dot'],
    [/^(departing|returning|return|check-in|check-out|start date|end of date|pick up date|drop off date|date)/i, 'fa-calendar'],
    [/^(adult|adults|child|children|passenger|rooms|guests)/i, 'fa-user'],
    [/^(cabin|cruise ship|all ships)/i, 'fa-ship']
  ];
  document.querySelectorAll('.form1 .select1_inner, .form1 .input1_inner').forEach(function (box) {
    var label = box.parentElement.querySelector('label');
    if (!label) return;
    var text = label.textContent.trim();
    var icon = null;
    // Dates first: "Pick up Date" is a date, not a place.
    if (/date|check-|departing|returning|return:/i.test(text)) icon = 'fa-calendar';
    else FIELD_ICONS.some(function (row) { if (row[0].test(text)) { icon = row[1]; return true; } return false; });
    if (!icon) return;
    // Number pickers (1, 2, 3…) are narrow: the number is enough.
    var sel = box.querySelector('select');
    if (sel && Array.prototype.every.call(sel.options, function (o) { return /^\s*\d+\s*$/.test(o.textContent); })) return;
    var i = document.createElement('i');
    i.className = 'field-icon fa-' + (icon === 'fa-calendar' || icon === 'fa-user' ? 'regular ' : 'solid ') + icon;
    i.setAttribute('aria-hidden', 'true');
    box.prepend(i);
    box.classList.add('has-icon');
    if (icon === 'fa-location-dot') box.classList.add('is-place');
  });

  document.querySelectorAll('.form1').forEach(function (form) {
    var boxes = Array.prototype.filter.call(form.querySelectorAll('.select1_inner'), function (box) {
      var l = box.parentElement.querySelector('label');
      return l && /^(flying from|to):?$/i.test(l.textContent.trim());
    });
    if (boxes.length !== 2) return;
    var a = boxes[0].querySelector('select');
    var b = boxes[1].querySelector('select');
    var swap = document.createElement('button');
    swap.type = 'button';
    swap.className = 'swap-places';
    swap.setAttribute('aria-label', 'Swap departure and destination');
    swap.innerHTML = '<i class="fa-solid fa-arrow-right-arrow-left" aria-hidden="true"></i>';
    boxes[0].appendChild(swap);
    swap.addEventListener('click', function (event) {
      event.stopPropagation();
      var x = a.selectedIndex;
      a.selectedIndex = b.selectedIndex;
      b.selectedIndex = x;
      [a, b].forEach(function (s) { s.dispatchEvent(new Event('change', { bubbles: true })); });
    });
  });

  /*----------------------------------------------------*/
  // Dropdowns (custom look for every select in .select1_inner)
  /*----------------------------------------------------*/
  // The native <select> stays in the page and keeps its value, so forms
  // work as before; a button and a list draw it. Keyboard: arrows, Home,
  // End, Enter, Escape and typing the first letters of an option.
  var uid = 0;
  var openSelect = null;

  function closeSelect() {
    if (!openSelect) return;
    openSelect.box.classList.remove('is-open');
    openSelect.button.setAttribute('aria-expanded', 'false');
    openSelect = null;
  }

  document.querySelectorAll('.select1_inner select').forEach(function (select) {
    var box = select.parentElement;
    var id = 'cs' + (++uid);
    var label = box.parentElement.querySelector('label');
    if (label && !label.id) label.id = id + '-label';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'cs__button';
    button.id = id + '-button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    if (label) button.setAttribute('aria-labelledby', label.id + ' ' + button.id);

    var list = document.createElement('ul');
    list.className = 'cs__list';
    list.id = id + '-list';
    list.setAttribute('role', 'listbox');
    list.tabIndex = -1;
    if (label) list.setAttribute('aria-labelledby', label.id);
    button.setAttribute('aria-controls', list.id);

    var options = Array.prototype.map.call(select.options, function (option, i) {
      var li = document.createElement('li');
      li.id = id + '-o' + i;
      li.setAttribute('role', 'option');
      li.textContent = option.textContent;
      list.appendChild(li);
      return li;
    });
    // The first option is a prompt ("City or Airport") when it is not a number.
    var prompt = isNaN(parseInt(select.options[0].textContent, 10));
    var active = select.selectedIndex;

    function render() {
      var i = select.selectedIndex;
      button.textContent = select.options[i].textContent;
      button.classList.toggle('is-prompt', prompt && i === 0);
      options.forEach(function (li, n) { li.setAttribute('aria-selected', String(n === i)); });
    }
    function setActive(i) {
      active = Math.max(0, Math.min(options.length - 1, i));
      options.forEach(function (li, n) { li.classList.toggle('is-active', n === active); });
      list.setAttribute('aria-activedescendant', options[active].id);
      var li = options[active];
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
    }
    function open() {
      closeSelect();
      closePicker();
      box.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      openSelect = { box: box, button: button };
      setActive(select.selectedIndex);
      list.focus();
    }
    function choose(i) {
      if (i !== select.selectedIndex) {
        select.selectedIndex = i;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      render();
      closeSelect();
      button.focus();
    }

    select.classList.add('cs__native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    box.classList.add('cs');
    box.appendChild(button);
    box.appendChild(list);
    render();
    select.addEventListener('change', render);

    button.addEventListener('click', function () {
      if (box.classList.contains('is-open')) closeSelect(); else open();
    });
    button.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); }
    });
    list.addEventListener('click', function (event) {
      var li = event.target.closest('[role="option"]');
      if (li) choose(options.indexOf(li));
    });
    list.addEventListener('mousemove', function (event) {
      var li = event.target.closest('[role="option"]');
      if (li) setActive(options.indexOf(li));
    });
    var typed = '';
    var typedTimer;
    list.addEventListener('keydown', function (event) {
      var key = event.key;
      if (key === 'ArrowDown') { event.preventDefault(); setActive(active + 1); }
      else if (key === 'ArrowUp') { event.preventDefault(); setActive(active - 1); }
      else if (key === 'Home') { event.preventDefault(); setActive(0); }
      else if (key === 'End') { event.preventDefault(); setActive(options.length - 1); }
      else if (key === 'Enter' || key === ' ') { event.preventDefault(); choose(active); }
      else if (key === 'Escape') { event.preventDefault(); closeSelect(); button.focus(); }
      else if (key === 'Tab') { closeSelect(); }
      else if (key.length === 1) {
        typed += key.toLowerCase();
        clearTimeout(typedTimer);
        typedTimer = setTimeout(function () { typed = ''; }, 600);
        for (var n = 0; n < options.length; n++) {
          if (options[n].textContent.toLowerCase().indexOf(typed) === 0) { setActive(n); break; }
        }
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (openSelect && !openSelect.box.contains(event.target)) closeSelect();
  });

  /*----------------------------------------------------*/
  // Date range picker (the date fields of each form)
  /*----------------------------------------------------*/
  // A form with two date fields picks a range (departing and returning,
  // check-in and check-out); a form with one picks a single date. The
  // fields keep the chosen dates as YYYY-MM-DD in data-value.
  var DAY = 86400000;
  var monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  var shortDate = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  var longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  var picker = null;

  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function closePicker(returnFocus) {
    if (!picker) return;
    var p = picker;
    picker = null;
    p.el.remove();
    p.fields.forEach(function (f) { f.setAttribute('aria-expanded', 'false'); f.parentElement.classList.remove('is-picking'); });
    if (returnFocus) p.fields[p.editing].focus();
  }

  function openPicker(fields, editing) {
    closeSelect();
    closePicker();
    var today = midnight(new Date());
    var values = fields.map(function (f) { return f.dataset.value ? midnight(new Date(f.dataset.value + 'T00:00')) : null; });
    var range = fields.length === 2;
    var oneWayOk = range && /^departing/i.test((fields[0].getAttribute('aria-labelledby') && document.getElementById(fields[0].getAttribute('aria-labelledby')) || {}).textContent || '');
    var start = values[0];
    var end = range ? values[1] : null;
    var hover = null;
    var view = new Date((values[editing] || start || today).getFullYear(), (values[editing] || start || today).getMonth(), 1);
    var focusDay = values[editing] || start || today;

    var el = document.createElement('div');
    el.className = 'dp';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', range ? 'Choose your dates' : 'Choose a date');
    document.body.appendChild(el);
    picker = { el: el, fields: fields, editing: editing };
    fields.forEach(function (f) { f.setAttribute('aria-expanded', 'true'); });
    fields[editing].parentElement.classList.add('is-picking');

    var months = window.matchMedia('(min-width: 768px)').matches ? 2 : 1;

    function place() {
      var r = fields[0].parentElement.getBoundingClientRect();
      var width = el.offsetWidth;
      var left = Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - width - 12);
      el.style.left = Math.max(window.scrollX + 12, left) + 'px';
      el.style.top = (r.bottom + window.scrollY + 8) + 'px';
    }

    function month(first) {
      var html = '<div class="dp__month"><div class="dp__title">' + monthName.format(first) + '</div>' +
        '<div class="dp__week" aria-hidden="true"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>' +
        '<div class="dp__days" role="grid">';
      for (var i = 0; i < first.getDay(); i++) html += '<span></span>';
      var count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      var stop = end || (start && hover && hover > start ? hover : null);
      for (var d = 1; d <= count; d++) {
        var day = new Date(first.getFullYear(), first.getMonth(), d);
        var t = day.getTime();
        var cls = ['dp__day'];
        if (t === today.getTime()) cls.push('is-today');
        if (start && t === start.getTime()) cls.push(range && stop && stop > start ? 'is-start has-range' : 'is-start');
        if (range && stop && t === stop.getTime()) cls.push('is-end');
        if (range && start && stop && t > start.getTime() && t < stop.getTime()) cls.push('is-between');
        var past = t < today.getTime();
        html += '<button type="button" class="' + cls.join(' ') + '" data-day="' + iso(day) + '"' +
          (past ? ' disabled' : '') + ' tabindex="' + (t === focusDay.getTime() ? '0' : '-1') + '"' +
          ' aria-label="' + longDate.format(day) + '"' +
          ((start && t === start.getTime()) || (end && t === end.getTime()) ? ' aria-pressed="true"' : '') + '>' + d + '</button>';
      }
      return html + '</div></div>';
    }

    function summary() {
      if (!start) return range ? 'Pick your first date' : 'Pick a date';
      if (!range) return shortDate.format(start);
      if (!end) return shortDate.format(start) + (oneWayOk ? ' – pick a return date, or Done for one way' : ' – pick the second date');
      var nights = Math.round((end - start) / DAY);
      return shortDate.format(start) + ' – ' + shortDate.format(end) + ' · ' + nights + (nights === 1 ? ' night' : ' nights');
    }

    function draw(keepFocus) {
      var html = '<div class="dp__head">' +
        '<button type="button" class="dp__nav" data-nav="-1" aria-label="Previous month"' + (view <= new Date(today.getFullYear(), today.getMonth(), 1) ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
        '<button type="button" class="dp__nav" data-nav="1" aria-label="Next month"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div>' +
        '<div class="dp__months">';
      for (var m = 0; m < months; m++) html += month(new Date(view.getFullYear(), view.getMonth() + m, 1));
      html += '</div><div class="dp__foot"><span class="dp__summary" aria-live="polite">' + summary() + '</span>' +
        '<span class="dp__actions"><button type="button" class="dp__clear">Clear</button><button type="button" class="dp__done">Done</button></span></div>';
      el.innerHTML = html;
      place();
      if (keepFocus) {
        var f = el.querySelector('[data-day="' + iso(focusDay) + '"]');
        if (f && !f.disabled) f.focus();
      }
    }

    function write() {
      fields[0].value = start ? shortDate.format(start) : '';
      fields[0].dataset.value = start ? iso(start) : '';
      if (range) {
        fields[1].value = end ? shortDate.format(end) : '';
        fields[1].dataset.value = end ? iso(end) : '';
      }
      fields.forEach(function (f) { f.dispatchEvent(new Event('change', { bubbles: true })); });
    }

    function pick(day) {
      if (!range) { start = day; write(); closePicker(true); return; }
      if (editing === 1 && start && day > start) {
        end = day;
      } else if (!start || end || day <= start) {
        start = day; end = null; editing = 1; picker.editing = 1;
      } else {
        end = day;
      }
      write();
      fields.forEach(function (f, n) { f.parentElement.classList.toggle('is-picking', n === editing); });
      focusDay = day;
      if (start && end) { closePicker(); fields[1].focus(); return; }
      draw(true);
    }

    el.addEventListener('click', function (event) {
      event.stopPropagation();
      var nav = event.target.closest('[data-nav]');
      var day = event.target.closest('[data-day]');
      if (nav) {
        view = new Date(view.getFullYear(), view.getMonth() + Number(nav.dataset.nav), 1);
        draw();
      } else if (day) {
        pick(midnight(new Date(day.dataset.day + 'T00:00')));
      } else if (event.target.closest('.dp__clear')) {
        start = null; end = null; editing = 0; picker.editing = 0; write(); draw();
      } else if (event.target.closest('.dp__done')) {
        closePicker(true);
      }
    });
    el.addEventListener('mouseover', function (event) {
      var day = event.target.closest('[data-day]');
      if (!range || !start || end || !day) return;
      var d = midnight(new Date(day.dataset.day + 'T00:00'));
      if (!hover || d.getTime() !== hover.getTime()) {
        hover = d;
        el.querySelectorAll('.dp__day').forEach(function (b) {
          var t = new Date(b.dataset.day + 'T00:00').getTime();
          b.classList.toggle('is-between', t > start.getTime() && t < hover.getTime());
          b.classList.toggle('is-end', t === hover.getTime() && hover > start);
          b.classList.toggle('has-range', t === start.getTime() && hover > start);
        });
      }
    });
    el.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); closePicker(true); return; }
      var day = event.target.closest('[data-day]');
      if (!day) return;
      var move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
      if (!move) return;
      event.preventDefault();
      var next = new Date(new Date(day.dataset.day + 'T00:00').getTime() + move * DAY + 3600000);
      next = midnight(next);
      if (next < today) return;
      focusDay = next;
      var last = new Date(view.getFullYear(), view.getMonth() + months, 0);
      if (next < view || next > last) view = new Date(next.getFullYear(), next.getMonth() - (next > last ? months - 1 : 0), 1);
      draw(true);
    });

    draw(true);
  }

  document.querySelectorAll('form').forEach(function (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('.input1_inner input[type="date"]'));
    if (!fields.length) return;
    fields = fields.slice(0, 2);
    var labelOf = function (field) {
      var wrap = field.closest('.input1_wrapper');
      return wrap && wrap.querySelector('label');
    };
    var active = function () { return fields; };

    fields.forEach(function (field, n) {
      var label = labelOf(field);
      // A date already in the markup (YYYY-MM-DD) is shown the same way as a picked one.
      var preset = /^\d{4}-\d{2}-\d{2}$/.test(field.value) ? field.value : '';
      field.type = 'text';
      if (preset) {
        field.dataset.value = preset;
        field.value = shortDate.format(new Date(preset + 'T00:00'));
      }
      field.readOnly = true;
      field.placeholder = 'Add date';
      field.classList.add('dp__field');
      field.setAttribute('role', 'combobox');
      field.setAttribute('aria-haspopup', 'dialog');
      field.setAttribute('aria-expanded', 'false');
      if (label) {
        if (!label.id) label.id = 'dp' + (++uid) + '-label';
        field.setAttribute('aria-labelledby', label.id);
      }
      var open = function () {
        openPicker(active(), Math.min(n, active().length - 1));
      };
      field.addEventListener('click', function (event) {
        event.stopPropagation();
        if (picker && picker.fields[0] === fields[0]) closePicker(); else open();
      });
      field.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') { event.preventDefault(); open(); }
      });
    });

    // A return date is optional: Done after the first date makes it one way,
    // and the × in the second field takes the return date off again.
    if (fields.length !== 2) return;
    var ret = fields[1];
    var clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'dp__unset';
    clear.setAttribute('aria-label', 'Remove the ' + (labelOf(ret) ? labelOf(ret).textContent.replace(':', '').trim().toLowerCase() : 'second') + ' date');
    clear.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    ret.parentElement.appendChild(clear);
    var sync = function () {
      ret.parentElement.classList.toggle('has-value', !!ret.dataset.value);
      ret.placeholder = fields[0].dataset.value && !ret.dataset.value && /^return/i.test(labelOf(ret) ? labelOf(ret).textContent.trim() : '') ? 'One way' : 'Add date';
    };
    fields.forEach(function (f) { f.addEventListener('change', sync); });
    clear.addEventListener('click', function (event) {
      event.stopPropagation();
      ret.value = '';
      ret.dataset.value = '';
      closePicker();
      sync();
      ret.focus();
    });
  });

  document.addEventListener('click', function (event) {
    if (picker && !picker.el.contains(event.target)) closePicker();
  });
  window.addEventListener('resize', function () { closePicker(); });

  /*----------------------------------------------------*/
  // Share links on blog posts: filled with this page's address.
  /*----------------------------------------------------*/
  var pageUrl = encodeURIComponent(window.location.href.split('#')[0]);
  var pageTitle = encodeURIComponent(document.title);
  var SHARE = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl,
    x: 'https://x.com/intent/post?url=' + pageUrl + '&text=' + pageTitle,
    pinterest: 'https://www.pinterest.com/pin/create/button/?url=' + pageUrl + '&description=' + pageTitle,
    email: 'mailto:?subject=' + pageTitle + '&body=' + pageUrl
  };
  document.querySelectorAll('[data-share]').forEach(function (a) {
    if (SHARE[a.dataset.share]) a.href = SHARE[a.dataset.share];
  });

  /*----------------------------------------------------*/
  // Result views (Hotels, Flights, Cars, Cruises pages): the three buttons
  // next to Sort by show the results as a grid, a list or two large cards.
  /*----------------------------------------------------*/
  document.querySelectorAll('.form3 .buttons').forEach(function (group) {
    var results = group.closest('form').nextElementSibling;
    while (results && !results.classList.contains('row')) results = results.nextElementSibling;
    if (!results) return;
    results.classList.add('results', 'view-grid');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Show results as');
    var buttons = group.querySelectorAll('[data-view]');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        results.classList.remove('view-grid', 'view-list', 'view-wide');
        results.classList.add('view-' + b.dataset.view);
      });
    });
  });

  /*----------------------------------------------------*/
  // Sort by (Hotels, Flights, Cars, Cruises pages): each menu reorders the
  // cards below it. Values are "<key>-1" or "<key>-2" (the second is the
  // reverse): name, price, rating (stars or data-rating), popularity (the
  // order in the HTML; -2 shows the newest, last added, first).
  /*----------------------------------------------------*/
  document.querySelectorAll('.form3:not(.results-sort)').forEach(function (form) {
    var grid = form.nextElementSibling;
    while (grid && !grid.classList.contains('row')) grid = grid.nextElementSibling;
    if (!grid) return;
    var cells = Array.prototype.filter.call(grid.children, function (c) { return c.querySelector('.thumbnail'); });
    cells.forEach(function (c, i) { c.setAttribute('data-order', i); });
    var read = {
      name: function (c) { var t = c.querySelector('.txt1'); return t ? t.textContent.trim().toLowerCase() : ''; },
      price: function (c) { var p = c.querySelector('.price'); return p ? parseFloat(p.textContent.replace(/[^0-9.]/g, '')) || 0 : 0; },
      rating: function (c) {
        var holder = c.querySelector('[data-rating]');
        if (holder) return parseFloat(holder.getAttribute('data-rating'));
        return c.querySelectorAll('.stars2 .fa-star').length + c.querySelectorAll('.stars2 .fa-star-half-stroke').length / 2;
      },
      popularity: function (c) { return -parseFloat(c.getAttribute('data-order')); }
    };
    form.addEventListener('change', function (event) {
      var m = /^(name|price|rating|popularity)-(1|2)$/.exec(event.target.value || '');
      if (!m) return;
      var key = m[1];
      // Name and price go up first; rating and popularity go down first.
      var dir = (key === 'name' || key === 'price' ? 1 : -1) * (m[2] === '2' ? -1 : 1);
      cells.slice().sort(function (a, b) {
        var x = read[key](a), y = read[key](b);
        return (x < y ? -1 : x > y ? 1 : 0) * dir;
      }).forEach(function (c) { grid.appendChild(c); });
    });
  });

  /*----------------------------------------------------*/
  // Place suggestions while typing, for text boxes marked data-suggest
  // (the pick-up and return boxes on search-cars.html). Edit PLACES to
  // offer your own locations.
  /*----------------------------------------------------*/
  var PLACES = [
    ['Prague (PRG)', 'Václav Havel Airport, Czechia'], ['Prague', 'City center, Czechia'],
    ['Lisbon (LIS)', 'Humberto Delgado Airport, Portugal'], ['Lisbon', 'City center, Portugal'],
    ['London (LHR)', 'Heathrow Airport, United Kingdom'], ['Paris (CDG)', 'Charles de Gaulle Airport, France'],
    ['Rome (FCO)', 'Fiumicino Airport, Italy'], ['Barcelona (BCN)', 'El Prat Airport, Spain'],
    ['Vienna (VIE)', 'Vienna International Airport, Austria'], ['Munich (MUC)', 'Munich Airport, Germany'],
    ['Zurich (ZRH)', 'Zurich Airport, Switzerland'], ['Tbilisi (TBS)', 'Tbilisi International Airport, Georgia'],
    ['New York (JFK)', 'John F. Kennedy International, United States'], ['Miami (MIA)', 'Miami International, United States'],
    ['Los Angeles (LAX)', 'Los Angeles International, United States'], ['Athens (ATH)', 'Athens International, Greece']
  ];
  document.querySelectorAll('input[data-suggest]').forEach(function (input) {
    var box = input.parentElement;
    box.classList.add('cs', 'sg');
    var id = input.id || ('sg' + (++uid));
    input.id = id;
    var list = document.createElement('ul');
    list.className = 'cs__list';
    list.id = id + '-list';
    list.setAttribute('role', 'listbox');
    box.appendChild(list);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', list.id);
    var items = [];
    var active = -1;
    function close() { box.classList.remove('is-open'); input.setAttribute('aria-expanded', 'false'); active = -1; }
    function mark(i) {
      active = i;
      items.forEach(function (li, n) { li.classList.toggle('is-active', n === i); });
      if (i > -1) input.setAttribute('aria-activedescendant', items[i].id); else input.removeAttribute('aria-activedescendant');
    }
    function show() {
      var q = input.value.trim().toLowerCase();
      var found = PLACES.filter(function (p) { return !q || (p[0] + ' ' + p[1]).toLowerCase().indexOf(q) > -1; }).slice(0, 7);
      list.innerHTML = '';
      items = found.map(function (p, n) {
        var li = document.createElement('li');
        li.id = id + '-o' + n;
        li.setAttribute('role', 'option');
        li.innerHTML = '<i class="fa-solid fa-location-dot" aria-hidden="true"></i><span><b></b><small></small></span>';
        li.querySelector('b').textContent = p[0];
        li.querySelector('small').textContent = p[1];
        li.addEventListener('mousedown', function (e) { e.preventDefault(); input.value = p[0]; close(); });
        list.appendChild(li);
        return li;
      });
      box.classList.toggle('is-open', items.length > 0);
      input.setAttribute('aria-expanded', String(items.length > 0));
      mark(-1);
    }
    input.addEventListener('focus', function () { input.select(); show(); });
    input.addEventListener('input', show);
    input.addEventListener('blur', close);
    input.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) { if (e.key === 'ArrowDown') show(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); mark(Math.min(items.length - 1, active + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(Math.max(0, active - 1)); }
      else if (e.key === 'Enter' && active > -1) { e.preventDefault(); input.value = items[active].querySelector('b').textContent; close(); }
      else if (e.key === 'Escape') { close(); }
    });
  });

  /*----------------------------------------------------*/
  // About: the team becomes a carousel below 992px.
  /*----------------------------------------------------*/
  // The same pattern for the team member page's favourite places.
  document.querySelectorAll('.team-swiper, .places-swiper').forEach(function (teamEl) {
    if (!window.Swiper) return;
    var team = null;
    var wide = window.matchMedia('(min-width: 992px)');
    var toggleTeam = function () {
      if (!wide.matches && !team) {
        team = new window.Swiper(teamEl, {
          slidesPerView: 1.15, spaceBetween: 16, grabCursor: true, a11y: a11yFor(teamEl),
          breakpoints: { 576: { slidesPerView: 2.15, spaceBetween: 20 } },
          pagination: dots(teamEl.querySelector('.team-pagination'), teamEl.classList.contains('places-swiper') ? 'Show destination' : 'Show team member')
        });
      } else if (wide.matches && team) {
        team.destroy(true, true);
        team = null;
      }
    };
    toggleTeam();
    wide.addEventListener('change', toggleTeam);
  });

  /*----------------------------------------------------*/
  // Footer newsletter: checks the address and thanks the visitor. Connect
  // the form to your mailing list service before going live.
  /*----------------------------------------------------*/
  document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var note = form.querySelector('[data-newsletter-note]');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var ok = input.value.trim() !== '' && input.checkValidity();
      form.classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      note.textContent = ok ? 'Thanks! Check your inbox to confirm your subscription.' : 'Enter an email address like name@example.com.';
      if (ok) form.reset(); else input.focus();
    });
    input.addEventListener('input', function () {
      if (!form.classList.contains('is-invalid')) return;
      form.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      note.textContent = '';
    });
  });

  /*----------------------------------------------------*/
  // Customer photos: when the photo is missing or fails to load, show the
  // initials from data-initials="EC" in a teal circle instead.
  /*----------------------------------------------------*/
  document.querySelectorAll('img[data-initials]').forEach(function (img) {
    var swap = function () {
      var circle = document.createElement('span');
      circle.className = (img.className + ' avatar-initials').trim();
      circle.textContent = img.getAttribute('data-initials');
      if (img.alt) { circle.setAttribute('role', 'img'); circle.setAttribute('aria-label', img.alt); }
      else circle.setAttribute('aria-hidden', 'true');
      img.replaceWith(circle);
    };
    if (!img.getAttribute('src') || (img.complete && !img.naturalWidth)) swap();
    else img.addEventListener('error', swap);
  });

  /*----------------------------------------------------*/
  // Flyout submenus open to the left when there is no room on the right.
  /*----------------------------------------------------*/
  document.querySelectorAll('.sub-menu li:not(.mega li)').forEach(function (item) {
    var flyout = item.querySelector(':scope > ul');
    if (!flyout) return;
    var place = function () {
      if (!window.matchMedia('(min-width: 768px)').matches) return;
      item.classList.remove('opens-left');
      var parentBox = item.getBoundingClientRect();
      var width = flyout.offsetWidth || 200;
      if (parentBox.right + width + 16 > document.documentElement.clientWidth) item.classList.add('opens-left');
    };
    item.addEventListener('mouseenter', place);
    item.addEventListener('focusin', place);
  });

  /*----------------------------------------------------*/
  // Blog and post pages: sidebar on the right, the left or none. The
  // choice is in the page address (blog.html?layout=left) so it can be
  // linked; set the default by changing data-layout="right" below.
  /*----------------------------------------------------*/
  var layoutRow = document.querySelector('.blog-layout');
  var layoutSwitch = document.querySelector('.layout-switch');
  if (layoutRow) {
    var layouts = ['right', 'left', 'none'];
    var setLayout = function (name, push) {
      if (layouts.indexOf(name) < 0) name = 'right';
      layouts.forEach(function (l) { layoutRow.classList.toggle('layout-' + l, l === name); });
      if (layoutSwitch) {
        layoutSwitch.querySelectorAll('[data-layout]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.layout === name)); });
      }
      if (push && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (name === 'right') url.searchParams.delete('layout'); else url.searchParams.set('layout', name);
        window.history.replaceState(null, '', url.pathname.split('/').pop() + url.search + url.hash);
      }
    };
    setLayout(new URLSearchParams(window.location.search).get('layout') || 'right', false);
    if (layoutSwitch) {
      layoutSwitch.addEventListener('click', function (event) {
        var b = event.target.closest('[data-layout]');
        if (b) setLayout(b.dataset.layout, true);
      });
    }
  }

  /*----------------------------------------------------*/
  // Back to top (was UItoTop)
  /*----------------------------------------------------*/
  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.id = 'toTop';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<span id="toTopHover"></span>';
  document.body.appendChild(toTop);

  var updateToTop = function () {
    toTop.classList.toggle('is-visible', window.scrollY > 200);
  };
  window.addEventListener('scroll', updateToTop, { passive: true });
  updateToTop();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
})();
