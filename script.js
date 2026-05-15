(function () {
  var form = document.getElementById('surveyForm');
  var status = document.getElementById('formStatus');
  var submitButton = form.querySelector("button[type='submit']");
  var followUpBlock = form.querySelector('[data-follow-up]');
  var q27Inputs = Array.prototype.slice.call(form.querySelectorAll("input[name='q27']"));
  var followUpInputs = Array.prototype.slice.call(followUpBlock.querySelectorAll('input, textarea, select'));

  function setStatus(message, type) {
    status.textContent = message || '';
    status.className = 'form-status';

    if (type) {
      status.classList.add('is-' + type);
    }
  }

  function selectedValue(name) {
    var selected = form.querySelector("input[name='" + name + "']:checked");
    return selected ? selected.value : '';
  }

  function updateFollowUpVisibility() {
    var shouldShow = selectedValue('q27') === 'Yes';
    followUpBlock.hidden = !shouldShow;

    for (var i = 0; i < followUpInputs.length; i++) {
      followUpInputs[i].disabled = !shouldShow;
      if (!shouldShow) {
        followUpInputs[i].checked = false;
      }
    }
  }

  function validateCheckboxGroups() {
    var requiredGroups = Array.prototype.slice.call(form.querySelectorAll('[data-required-checkbox]'));

    for (var i = 0; i < requiredGroups.length; i++) {
      var name = requiredGroups[i].getAttribute('data-required-checkbox');
      if (!form.querySelector("input[name='" + name + "']:checked")) {
        setStatus('Please select at least one option for Q15.', 'error');
        requiredGroups[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
    }

    return true;
  }

  function buildPayload() {
    var formData = new FormData(form);
    var payload = new URLSearchParams();

    formData.forEach(function (value, key) {
      payload.append(key, value);
    });

    return payload;
  }

  function isConfiguredEndpoint(endpoint) {
    return endpoint && endpoint.indexOf('PASTE_DEPLOYED_APPS_SCRIPT_WEB_APP_URL_HERE') === -1;
  }

  for (var i = 0; i < q27Inputs.length; i++) {
    q27Inputs[i].addEventListener('change', updateFollowUpVisibility);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    setStatus('', '');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!validateCheckboxGroups()) {
      return;
    }

    var endpoint = form.getAttribute('data-endpoint').trim();
    if (!isConfiguredEndpoint(endpoint)) {
      setStatus('Paste your deployed Apps Script Web App URL into the form data-endpoint before publishing.', 'error');
      return;
    }

    submitButton.disabled = true;
    setStatus('Submitting survey...', '');

    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: buildPayload().toString()
    })
      .then(function () {
        form.reset();
        updateFollowUpVisibility();
        setStatus('Survey submitted. Thank you for your feedback.', 'success');
      })
      .catch(function () {
        setStatus('The survey could not be submitted. Please check the Web App URL and try again.', 'error');
      })
      .finally(function () {
        submitButton.disabled = false;
      });
  });

  updateFollowUpVisibility();
})();
