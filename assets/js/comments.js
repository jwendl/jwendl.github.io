function setupForm() {
  var postUri = document.getElementById('post_uri');
  var status = document.getElementById('commentstatus');
  status.innerText = '';

  var requiredIds = [ 'message', 'email', 'name'];
  var missing = requiredIds.filter(id => document.getElementById(id).value.length < 3);
  if (missing.length > 0) {
    status.innerText = 'Some required fields are missing - (' + missing.join(', ') + ')';
    return;
  }

  var button = document.getElementById('commentbutton');
  if (button.innerText != 'Confirm comment') {
    button.innerText = 'Confirm comment';
    return;
  }

  var form = document.getElementById('commentform');
  form.action = postUri.value;
  button.innerText = 'Posting...';
  button.disabled = true;
  form.submit();
}