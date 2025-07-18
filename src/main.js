window.addEventListener('DOMContentLoaded', () => {
  // Add debug output element
  let debugDiv = document.createElement('div');
  debugDiv.id = 'debug-output';
  debugDiv.style.position = 'fixed';
  debugDiv.style.bottom = '10px';
  debugDiv.style.left = '10px';
  debugDiv.style.background = 'rgba(0,0,0,0.7)';
  debugDiv.style.color = 'white';
  debugDiv.style.padding = '8px 12px';
  debugDiv.style.borderRadius = '6px';
  debugDiv.style.fontSize = '14px';
  debugDiv.style.zIndex = 1001;
  debugDiv.textContent = 'Waiting for deviceorientation events...';
  document.body.appendChild(debugDiv);

  // iOS 13+ requires permission
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    const btn = document.createElement('button');
    btn.textContent = 'Enable Tilt Effect';
    btn.style.position = 'fixed';
    btn.style.top = '20px';
    btn.style.left = '50%';
    btn.style.transform = 'translateX(-50%)';
    btn.style.zIndex = 1000;
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      DeviceOrientationEvent.requestPermission().then((response) => {
        if (response === 'granted') {
          enableTilt();
          btn.remove();
        } else {
          btn.textContent = 'Permission Denied';
        }
      });
    });
  } else if (typeof DeviceOrientationEvent !== 'undefined') {
    enableTilt();
  } else {
    // DeviceOrientationEvent not supported
    debugDiv.textContent =
      'DeviceOrientationEvent not supported on this device/browser.\n' +
      'To enable tilt on Android/Chrome:\n' +
      '1. Serve this page over HTTPS (not HTTP).\n' +
      '2. Tap the lock icon in the address bar > Site settings > Enable "Motion sensors".\n' +
      '3. Reload the page.\n' +
      'If it still does not work, update your browser to the latest version';
  }
});

function enableTilt() {
  const goldLayer = document.getElementById('gold-layer');
  if (!goldLayer) return;

  const sensitivity = 0.5;
  const maxTranslate = 30;

  let eventReceived = false;
  let eventTimeout = setTimeout(() => {
    if (!eventReceived) {
      const debugDiv = document.getElementById('debug-output');
      if (debugDiv) {
        debugDiv.textContent = 'No deviceorientation events detected. Check browser permissions or try HTTPS.';
      }
    }
  }, 3000);

  function handleOrientation(event) {
    eventReceived = true;
    clearTimeout(eventTimeout);

    // Show event values on the page
    const debugDiv = document.getElementById('debug-output');
    if (debugDiv) {
      debugDiv.textContent =
        `alpha: ${event.alpha?.toFixed(2)}\n` +
        `beta: ${event.beta?.toFixed(2)}\n` +
        `gamma: ${event.gamma?.toFixed(2)}`;
    }

    const x = event.gamma || 0;
    const y = event.beta || 0;
    const translateX = Math.max(Math.min(x * sensitivity, maxTranslate), -maxTranslate);
    const translateY = Math.max(Math.min(y * sensitivity, maxTranslate), -maxTranslate);
    goldLayer.style.transform = `translate(${translateX}px, ${translateY}px)`;
  }

  // Debug: log if event listener is attached
  console.log('Adding deviceorientation listener');
  window.addEventListener('deviceorientation', handleOrientation, true);
}
