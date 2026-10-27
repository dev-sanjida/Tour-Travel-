/*----------------------------------------------------*/
/* Travel Agency - booking confirmed page (booking-success.html)
/* A short burst of confetti in the template's colors. Skipped for
/* visitors who prefer reduced motion.
/*----------------------------------------------------*/
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var colors = ['#1cbbb4', '#00a99d', '#fff799', '#f7c016', '#e8202a', '#9bdedb'];
  var box = document.createElement('div');
  box.className = 'done__confetti';
  box.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < 70; i++) {
    var piece = document.createElement('i');
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
    piece.style.animationDelay = (Math.random() * 0.6) + 's';
    piece.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    box.appendChild(piece);
  }
  document.body.appendChild(box);
  setTimeout(function () { box.remove(); }, 4800);
})();
