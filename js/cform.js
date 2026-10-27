/*----------------------------------------------------*/
/* Travel Agency - Contact form
/* Page: contacts.html
/* Posts the form to contact.php without leaving the page and shows the reply
/* in #note. contact.php answers "OK" on success, or an HTML error message.
/*----------------------------------------------------*/
(function () {
  'use strict';

  var form = document.getElementById('ajax-contact-form');
  if (!form) return;

  var note = document.getElementById('note');
  var fields = document.getElementById('fields');
  var submit = form.querySelector('[type="submit"]');

  var showNote = function (html) {
    if (note) note.innerHTML = html;
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (submit) submit.disabled = true;

    fetch(form.getAttribute('action') || 'contact.php', {
      method: 'POST',
      body: new URLSearchParams(new FormData(form))
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function (message) {
        if (message.trim() === 'OK') {
          showNote('<div class="notification_ok">Your message has been sent. Thank you!<br> <a href="#ajax-contact-form" data-form-reset>Send another message</a></div>');
          if (fields) fields.hidden = true;
        } else {
          showNote(message);
        }
      })
      .catch(function () {
        showNote('<div class="notification_error">Sorry, your message could not be sent. Please try again later.</div>');
      })
      .finally(function () {
        if (submit) submit.disabled = false;
      });
  });

  if (note) {
    note.addEventListener('click', function (event) {
      if (!event.target.closest('[data-form-reset]')) return;
      event.preventDefault();
      showNote('');
      form.reset();
      if (fields) fields.hidden = false;
      var first = form.querySelector('input, textarea');
      if (first) first.focus();
    });
  }
})();
