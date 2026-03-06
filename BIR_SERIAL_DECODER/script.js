document.getElementById("lookupBtn").addEventListener("click", function () {
  const serial = document.getElementById("serialInput").value.trim();
  const result = document.getElementById("result");

  if (!serial) {
    result.textContent = "Please enter a serial number.";
    return;
  }

  const serialNum = parseInt(serial, 10);

  if (isNaN(serialNum)) {
    result.textContent = "Serial number must be numeric.";
    return;
  }

  // Placeholder example ranges only
  if (serialNum < 10000) {
    result.textContent = "Approximate year: 1939–1940";
  } else if (serialNum < 50000) {
    result.textContent = "Approximate year: 1941–1945";
  } else {
    result.textContent = "Approximate year: later production range";
  }
});