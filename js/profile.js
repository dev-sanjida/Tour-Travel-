/*----------------------------------------------------*/
/* Travel Agency - team member page (profile.html)
/* One page for every team member: the link from the About page says who,
/* e.g. profile.html?member=george. The page shows Jynda by default; the
/* details of each person are in TEAM below. To add someone, copy an entry,
/* give it a new key and link to profile.html?member=<key>.
/*----------------------------------------------------*/
(function () {
  'use strict';

  var TEAM = {
    jynda: {
      name: 'Jynda Martin', first: 'Jynda', role: 'Marketing Manager', photo: 'images/team01.jpg',
      countries: '48', trips: '120+', languages: 'English, French, Spanish',
      bio: ['Jynda joined the agency eleven years ago as a travel writer and now runs our marketing, from the weekly deals newsletter to the destination guides on this site. She still writes most of those guides herself, after visiting every place she recommends.',
        'Her favorite trips are slow ones: a week on the Amalfi Coast with no plans, or a train across the Swiss Alps with a good book. Ask her about small hotels in southern Europe and she will have three names for you before you finish the question.'],
      tags: ['Southern Europe', 'Boutique hotels', 'Rail journeys', 'Food and wine'],
      places: [['images/gallery03.jpg', 'Kyoto, Japan'], ['images/gallery07.jpg', 'Lisbon, Portugal'], ['images/gallery06.jpg', 'Marrakech, Morocco']],
      quote: 'The best trip is the one that still feels easy on the last day. That is what I plan for.'
    },
    george: {
      name: 'George Smith', first: 'George', role: 'Site Administrator', photo: 'images/team02.jpg',
      countries: '31', trips: '60+', languages: 'English, German',
      bio: ['George keeps the booking site fast and secure, and makes sure every price you see is the price you pay. Before joining us he spent eight years building booking systems for airlines.',
        'When he is not at his desk he is usually on a bike: he has ridden the Danube from Passau to Vienna twice and is planning the coast of Portugal next.'],
      tags: ['Cycling holidays', 'City breaks', 'Last-minute flights', 'Central Europe'],
      places: [['images/gallery01.jpg', 'New York, USA'], ['images/gallery08.jpg', 'Lisbon, Portugal'], ['images/gallery11.jpg', 'Iceland']],
      quote: 'A good booking takes two minutes. Everything I build is about getting it there.'
    },
    bill: {
      name: 'Bill Amadeus', first: 'Bill', role: 'Tour Operator', photo: 'images/team04.jpg',
      countries: '57', trips: '200+', languages: 'English, Italian, Greek',
      bio: ['Bill builds our group tours and cruises, and has led more than sixty trips across Europe himself. He checks every hotel, guide and transfer on a tour before the first guest books it.',
        'He grew up on the Greek island of Naxos and still spends every September there. His Cyclades island-hopping tour is the most booked trip we sell.'],
      tags: ['Group tours', 'Cruises', 'Greek islands', 'Adventure trips'],
      places: [['images/gallery02.jpg', 'Cappadocia, Turkey'], ['images/gallery05.jpg', 'The Alps'], ['images/gallery09.jpg', 'Safari, Kenya']],
      quote: 'If I would not take my own family on a tour, it does not go on the site.'
    },
    amanda: {
      name: 'Amanda Stoun', first: 'Amanda', role: 'Director', photo: 'images/team03.jpg',
      countries: '64', trips: '300+', languages: 'English, Spanish, Portuguese',
      bio: ['Amanda founded the agency in 2009 with two desks and a phone, and still personally reviews every new hotel we add to the site. She believes a travel agency should be judged by the trips that go wrong, and how quickly they are fixed.',
        'She travels at least once a month, usually somewhere new, and writes a short note for the team about every place she visits.'],
      tags: ['Luxury travel', 'Family holidays', 'Latin America', 'Long-haul trips'],
      places: [['images/gallery04.jpg', 'Maldives'], ['images/gallery10.jpg', 'Tbilisi, Georgia'], ['images/gallery01.jpg', 'New York, USA']],
      quote: 'We are only as good as our answer at three in the morning, when a flight is canceled.'
    }
  };

  var key = new URLSearchParams(window.location.search).get('member');
  var p = TEAM[key] || TEAM.jynda;
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var set = function (name, fn) { document.querySelectorAll('[data-p="' + name + '"]').forEach(fn); };

  document.title = p.name + ' | Travel Agency';
  ['name', 'first', 'role', 'countries', 'trips', 'languages'].forEach(function (f) { set(f, function (el) { el.textContent = p[f]; }); });
  set('photo', function (img) { img.src = p.photo; img.alt = p.name; });
  set('bio', function (el) { el.innerHTML = p.bio.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join(''); });
  set('tags', function (el) { el.innerHTML = p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join(''); });
  set('places', function (el) {
    el.innerHTML = p.places.map(function (pl) {
      return '<div class="col-6 col-md-4 swiper-slide"><a class="profile-place" href="gallery.html"><figure><img src="' + esc(pl[0]) + '" alt="' + esc(pl[1]) + '" width="740" height="500" class="img-fluid" loading="lazy"><figcaption aria-hidden="true">' + esc(pl[1]) + '</figcaption></figure></a></div>';
    }).join('');
  });
  set('quote', function (el) { el.textContent = '“' + p.quote + '”'; });
  set('others', function (el) {
    el.innerHTML = Object.keys(TEAM).filter(function (k) { return TEAM[k] !== p; }).map(function (k) {
      var o = TEAM[k];
      return '<li><a href="profile.html?member=' + k + '"><img src="' + esc(o.photo) + '" alt="" width="64" height="64"><span><b>' + esc(o.name) + '</b>' + esc(o.role) + '</span></a></li>';
    }).join('');
  });
})();
