window.onload = function () {
  var apiKey = "47082344";
  var sessionId = "1_MX40NzA4MjM0NH5-MTYxMDY4ODEyODg4OX5ycDRnZ2tVU3hMSHMrWkVKR21EdytuTmt-fg";
  var token = "T1==cGFydG5lcl9pZD00NzA4MjM0NCZzaWc9MTUxM2UyNTZlMDkwNTgwZDIzZjk3YzkzZDk4YWM1ZTBhODJiMDdjMTpzZXNzaW9uX2lkPTFfTVg0ME56QTRNak0wTkg1LU1UWXhNRFk0T0RFeU9EZzRPWDV5Y0RSbloydFZVM2hNU0hNcldrVktSMjFFZHl0dVRtdC1mZyZjcmVhdGVfdGltZT0xNjEwNjg4MTYwJm5vbmNlPTAuNzE5MTM4OTQ1MDkzNzU4NCZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNjEzMjgwMTU4JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9";

  // (optional) add server code here

  var SERVER_BASE_URL = 'http://localhost:8080';
  fetch(SERVER_BASE_URL + '/session').then((res) =>  {
    return res.json()
  }).then((res) => {
    apiKey = res.apiKey;
    sessionId = res.sessionId;
    token = res.token;
    initializeSession();
  }).catch(handleError);

  // Handling all of our errors here by alerting them
  function handleError(error) {
    if (error) {
      alert(error.message);
    }
  }
  /**
   * Function definition for initializeSession(), creates session with our credentials
   * and connects to the session. 
   */
  function initializeSession() {
    var session = OT.initSession(apiKey, sessionId);

    console.log('Initializing a OpenTok video session');
    /**
     * Subscribe to a newly created stream. 
     * @param event.stream is the stream object to which the client is subscribing
     * @param set of properties that define the appearance of the subscriber view
     * @param completion handler (optional) that is called when the subscribe() method
     * succeeds or fails
     */

    session.on('streamCreated',  (event) =>  {
      session.subscribe(event.stream, 'subscriber', {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      }, handleError);
    });

    /**
     * initPublisher initializes publisher object with OT.initPublisher.
     * @param publisher the div being replaced by this dom element
     * @param insertMode, width, height, are the properties of this publisher
     * @param optional, not present here (handle error not defined), is the 
     *  competion handler specification
     */
    var publisher = OT.initPublisher('publisher', {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    }, handleError);

    // Connect to the session
    session.connect(token, function (error) {
      if (error) {
        handleError(error);
      } else {
        session.publish(publisher, handleError);
      }
    });
  }
}
