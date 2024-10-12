
export const handler = async (event) => {

  // if no session, continue with custom challenge (next step is create auth challenge, then verify auth challenge)
  if (!event.request.session || event.request.session.length === 0) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
    return event;
  }
  // if session has length of 1, check if the passkey vas verified correctly
  else if (event.request.session.length === 1) {
    const session = event.request.session[0];
    if (session.challengeResult === true) return allow(event);
    return deny(event);
  }
  // deny everything else
  return deny(event);
};

function deny(event) {
  event.response.issueTokens = false;
  event.response.failAuthentication = true;
  return event;
}

function allow(event) {
  event.response.issueTokens = true;
  event.response.failAuthentication = false;
  return event;
}