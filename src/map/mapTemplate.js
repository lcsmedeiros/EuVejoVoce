export function buildMapHtml(lat, lng, salvos, alvoFoco = null) {
  const centroLat = alvoFoco ? alvoFoco.latitude  : lat;
  const centroLng = alvoFoco ? alvoFoco.longitude : lng;

  const marcadores = JSON.stringify(
    salvos.map((item) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      label: item.label || '(sem rótulo)',
      endereco: item.endereco || `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`,
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a1a; }
    #map { width: 100vw; height: 100vh; }

    .leaflet-popup-content-wrapper {
      background: rgba(7,9,15,0.92);
      border: 1px solid rgba(255,45,85,0.6);
      border-radius: 3px;
      color: #c5dce8;
      font-family: monospace;
      font-size: 11px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(255,45,85,0.2);
    }
    .leaflet-popup-tip { background: rgba(7,9,15,0.92); }
    .leaflet-control-zoom {
      border: 1px solid rgba(0,229,255,0.3) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
    }
    .leaflet-control-zoom a {
      background: rgba(7,9,15,0.85) !important;
      color: #00e5ff !important;
      border-color: rgba(0,229,255,0.2) !important;
      font-family: monospace !important;
      font-weight: 900 !important;
    }
    .leaflet-control-zoom a:hover { background: rgba(0,229,255,0.15) !important; }
    .leaflet-control-scale-line {
      background: rgba(7,9,15,0.75);
      border: 1px solid rgba(0,229,255,0.4);
      border-top: 2px solid #00e5ff;
      color: #00e5ff;
      font-family: monospace;
      font-size: 9px;
      letter-spacing: 1px;
    }
    .leaflet-control-attribution {
      background: rgba(7,9,15,0.7) !important;
      color: #2a3a4a !important;
      font-size: 8px;
    }
    .leaflet-control-attribution a { color: #2a3a4a !important; }

    #legend {
      position: fixed;
      ${alvoFoco != null ? 'top: 12px;' : 'bottom: 48px;'}
      left: 12px;
      background: rgba(7,9,15,0.82);
      border: 1px solid rgba(0,229,255,0.15);
      border-left: 2px solid #00e5ff;
      border-radius: 3px;
      padding: 10px 12px;
      font-family: monospace;
      z-index: 999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      min-width: 148px;
    }
    #modeSwitch {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 999;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }
    #modeBtn {
      background: rgba(7,9,15,0.85);
      border: 1px solid rgba(0,229,255,0.35);
      border-radius: 3px;
      color: #00e5ff;
      font-family: monospace;
      font-size: 9px;
      letter-spacing: 1.5px;
      padding: 7px 11px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      white-space: nowrap;
    }
    #modeBtn:active { background: rgba(0,229,255,0.15); }
    #poiInfo {
      background: rgba(7,9,15,0.82);
      border: 1px solid rgba(0,229,255,0.15);
      border-right: 2px solid #00e5ff;
      border-radius: 3px;
      color: rgba(0,229,255,0.45);
      font-family: monospace;
      font-size: 8px;
      letter-spacing: 1px;
      padding: 5px 9px;
      backdrop-filter: blur(4px);
      max-width: 160px;
      text-align: right;
      line-height: 1.6;
    }
    .lg-title {
      font-size: 8px;
      letter-spacing: 2px;
      color: rgba(0,229,255,0.35);
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(0,229,255,0.08);
      padding-bottom: 6px;
    }
    .lg-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .lg-row:last-child { margin-bottom: 0; }
    .lg-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .lg-dot-op  { background: #00e5ff; box-shadow: 0 0 5px #00e5ff; }
    .lg-dot-tgt { background: #ff2d55; box-shadow: 0 0 5px #ff2d55; }
    .lg-dot-sel { background: #ffd60a; box-shadow: 0 0 5px #ffd60a; }
    .lg-text {
      font-size: 9px;
      letter-spacing: 1.5px;
      color: #4a6a7a;
    }
    .lg-text-op  { color: #00b4cc; }
    .lg-text-sel { color: #c9a800; }
    .lg-divider {
      height: 1px;
      background: rgba(0,229,255,0.07);
      margin: 6px 0;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="modeSwitch">
    <button id="modeBtn" onclick="nextMode()">🛰 SAT+LABELS</button>
    <div id="poiInfo">RUAS · POIs · TURISMO</div>
  </div>
  <div id="legend">
    <div class="lg-title">HUD — MAPA TÁTICO</div>
    <div class="lg-row">
      <div class="lg-dot lg-dot-op"></div>
      <span class="lg-text lg-text-op">OPERADOR</span>
    </div>
    <div class="lg-row">
      <div class="lg-dot lg-dot-tgt"></div>
      <span class="lg-text">ALVOS</span>
    </div>
    ${alvoFoco == null ? `
    <div class="lg-divider"></div>
    <div class="lg-row">
      <div class="lg-dot lg-dot-sel"></div>
      <span class="lg-text lg-text-sel">TOQUE P/ MARCAR</span>
    </div>` : ''}
  </div>
  <script>
    var selectionMarker = null;
    var blastCircle = null;

    var map = L.map('map', { zoomControl: false }).setView([${centroLat}, ${centroLng}], 16);

    var osmBase = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 22, maxNativeZoom: 19,
    });

    var satBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri', maxZoom: 22, maxNativeZoom: 18, errorTileUrl: '',
    });

    var transOverlay = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
      attribution: '', maxZoom: 22, maxNativeZoom: 18, opacity: 0.85,
    });

    var labelsOverlay = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: '', maxZoom: 22, maxNativeZoom: 18, opacity: 0.95,
    });

    var MODES = ['hybrid', 'satellite', 'street'];
    var MODE_LABELS = { hybrid: '🛰 SAT+LABELS', satellite: '🌐 SATÉLITE', street: '📍 MAPA RUA' };
    var MODE_HINTS  = { hybrid: 'RUAS · POIs · TURISMO', satellite: 'IMAGEM AÉREA', street: 'MAPA DETALHADO' };
    var modeIdx = 0;

    function applyMode() {
      [osmBase, satBase, transOverlay, labelsOverlay].forEach(function(l) {
        if (map.hasLayer(l)) map.removeLayer(l);
      });
      var mode = MODES[modeIdx];
      if (mode === 'hybrid') {
        satBase.addTo(map); transOverlay.addTo(map); labelsOverlay.addTo(map);
      } else if (mode === 'satellite') {
        satBase.addTo(map); labelsOverlay.addTo(map);
      } else {
        osmBase.addTo(map);
      }
      document.getElementById('modeBtn').textContent = MODE_LABELS[mode];
      document.getElementById('poiInfo').textContent = MODE_HINTS[mode];
    }

    function nextMode() {
      modeIdx = (modeIdx + 1) % MODES.length;
      applyMode();
    }

    applyMode();

    L.control.scale({ imperial: false, metric: true }).addTo(map);

    var crosshairOp = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">'
      + '<circle cx="18" cy="18" r="15" stroke="rgba(0,0,0,0.5)" stroke-width="3" fill="none"/>'
      + '<circle cx="18" cy="18" r="15" stroke="#00e5ff" stroke-width="1" fill="none" opacity="0.9"/>'
      + '<circle cx="18" cy="18" r="7" stroke="rgba(0,0,0,0.5)" stroke-width="3" fill="none"/>'
      + '<circle cx="18" cy="18" r="7" stroke="#00e5ff" stroke-width="1" fill="none"/>'
      + '<circle cx="18" cy="18" r="2.5" stroke="rgba(0,0,0,0.6)" stroke-width="1.5" fill="#00e5ff"/>'
      + '<line x1="18" y1="2" x2="18" y2="10" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="18" y1="2" x2="18" y2="10" stroke="#00e5ff" stroke-width="1.5"/>'
      + '<line x1="18" y1="26" x2="18" y2="34" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="18" y1="26" x2="18" y2="34" stroke="#00e5ff" stroke-width="1.5"/>'
      + '<line x1="2" y1="18" x2="10" y2="18" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="2" y1="18" x2="10" y2="18" stroke="#00e5ff" stroke-width="1.5"/>'
      + '<line x1="26" y1="18" x2="34" y2="18" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="26" y1="18" x2="34" y2="18" stroke="#00e5ff" stroke-width="1.5"/>'
      + '</svg>';

    var crosshairTgt = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">'
      + '<circle cx="16" cy="16" r="14" stroke="rgba(0,0,0,0.5)" stroke-width="3" fill="none"/>'
      + '<circle cx="16" cy="16" r="14" stroke="#ff2d55" stroke-width="1.5" fill="none"/>'
      + '<circle cx="16" cy="16" r="6" stroke="rgba(0,0,0,0.4)" stroke-width="2.5" fill="none"/>'
      + '<circle cx="16" cy="16" r="6" stroke="#ff2d55" stroke-width="1" fill="rgba(255,45,85,0.2)"/>'
      + '<circle cx="16" cy="16" r="2.5" stroke="rgba(0,0,0,0.6)" stroke-width="1.5" fill="#ff2d55"/>'
      + '<line x1="16" y1="1" x2="16" y2="9" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="16" y1="1" x2="16" y2="9" stroke="#ff2d55" stroke-width="1.5"/>'
      + '<line x1="16" y1="23" x2="16" y2="31" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="16" y1="23" x2="16" y2="31" stroke="#ff2d55" stroke-width="1.5"/>'
      + '<line x1="1" y1="16" x2="9" y2="16" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="1" y1="16" x2="9" y2="16" stroke="#ff2d55" stroke-width="1.5"/>'
      + '<line x1="23" y1="16" x2="31" y2="16" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="23" y1="16" x2="31" y2="16" stroke="#ff2d55" stroke-width="1.5"/>'
      + '<line x1="3" y1="3" x2="7" y2="7" stroke="rgba(0,0,0,0.4)" stroke-width="2.5"/>'
      + '<line x1="3" y1="3" x2="7" y2="7" stroke="#ff2d55" stroke-width="1"/>'
      + '<line x1="29" y1="3" x2="25" y2="7" stroke="rgba(0,0,0,0.4)" stroke-width="2.5"/>'
      + '<line x1="29" y1="3" x2="25" y2="7" stroke="#ff2d55" stroke-width="1"/>'
      + '<line x1="3" y1="29" x2="7" y2="25" stroke="rgba(0,0,0,0.4)" stroke-width="2.5"/>'
      + '<line x1="3" y1="29" x2="7" y2="25" stroke="#ff2d55" stroke-width="1"/>'
      + '<line x1="29" y1="29" x2="25" y2="25" stroke="rgba(0,0,0,0.4)" stroke-width="2.5"/>'
      + '<line x1="29" y1="29" x2="25" y2="25" stroke="#ff2d55" stroke-width="1"/>'
      + '</svg>';

    var crosshairSel = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">'
      + '<circle cx="18" cy="18" r="15" stroke="rgba(0,0,0,0.5)" stroke-width="3" fill="none"/>'
      + '<circle cx="18" cy="18" r="15" stroke="#ffd60a" stroke-width="1.5" fill="none"/>'
      + '<circle cx="18" cy="18" r="6" stroke="rgba(0,0,0,0.4)" stroke-width="2.5" fill="none"/>'
      + '<circle cx="18" cy="18" r="6" stroke="#ffd60a" stroke-width="1" fill="rgba(255,214,10,0.2)"/>'
      + '<circle cx="18" cy="18" r="2.5" stroke="rgba(0,0,0,0.6)" stroke-width="1.5" fill="#ffd60a"/>'
      + '<line x1="18" y1="1" x2="18" y2="10" stroke="rgba(0,0,0,0.5)" stroke-width="4"/>'
      + '<line x1="18" y1="1" x2="18" y2="10" stroke="#ffd60a" stroke-width="2"/>'
      + '<line x1="18" y1="26" x2="18" y2="35" stroke="rgba(0,0,0,0.5)" stroke-width="4"/>'
      + '<line x1="18" y1="26" x2="18" y2="35" stroke="#ffd60a" stroke-width="2"/>'
      + '<line x1="1" y1="18" x2="10" y2="18" stroke="rgba(0,0,0,0.5)" stroke-width="4"/>'
      + '<line x1="1" y1="18" x2="10" y2="18" stroke="#ffd60a" stroke-width="2"/>'
      + '<line x1="26" y1="18" x2="35" y2="18" stroke="rgba(0,0,0,0.5)" stroke-width="4"/>'
      + '<line x1="26" y1="18" x2="35" y2="18" stroke="#ffd60a" stroke-width="2"/>'
      + '</svg>';

    var iconOp  = L.divIcon({ className:'', html: crosshairOp,  iconSize:[36,36], iconAnchor:[18,18], popupAnchor:[0,-20] });
    var iconSel = L.divIcon({ className:'', html: crosshairSel, iconSize:[36,36], iconAnchor:[18,18], popupAnchor:[0,-20] });

    L.marker([${lat}, ${lng}], { icon: iconOp })
      .addTo(map)
      .bindPopup(
        '<div style="color:#00e5ff;letter-spacing:2px;margin-bottom:4px;">◈ OPERADOR</div>'
        + '<div style="color:#3a5268;">POSIÇÃO ATUAL</div>'
      );

    var salvos = ${marcadores};
    salvos.forEach(function(item) {
      var iconTgt = L.divIcon({ className:'', html: crosshairTgt, iconSize:[32,32], iconAnchor:[16,16], popupAnchor:[0,-18] });
      L.marker([item.latitude, item.longitude], { icon: iconTgt })
        .addTo(map)
        .bindPopup(
          '<div style="color:#ff2d55;letter-spacing:2px;margin-bottom:4px;">⊕ ALVO CONFIRMADO</div>'
          + '<div style="color:#c5dce8;margin-bottom:2px;">' + item.label + '</div>'
          + '<div style="color:#3a5268;font-size:10px;">' + item.endereco + '</div>'
        );
    });

    ${alvoFoco == null ? `
    map.on('click', function(e) {
      if (selectionMarker) map.removeLayer(selectionMarker);
      selectionMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon: iconSel }).addTo(map);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'mapClick',
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      }));
    });
    ` : ''}

    function clearSelection() {
      if (selectionMarker) { map.removeLayer(selectionMarker); selectionMarker = null; }
    }

    function addMarker(lat, lng, label, endereco) {
      var iconTgt = L.divIcon({ className:'', html: crosshairTgt, iconSize:[32,32], iconAnchor:[16,16], popupAnchor:[0,-18] });
      L.marker([lat, lng], { icon: iconTgt })
        .addTo(map)
        .bindPopup(
          '<div style="color:#ff2d55;letter-spacing:2px;margin-bottom:4px;">⊕ ALVO CONFIRMADO</div>'
          + '<div style="color:#c5dce8;margin-bottom:2px;">' + label + '</div>'
          + '<div style="color:#3a5268;font-size:10px;">' + endereco + '</div>'
        );
    }

    function setBlast(lat, lng, raio, cor) {
      if (blastCircle) map.removeLayer(blastCircle);
      blastCircle = L.circle([lat, lng], {
        radius: raio,
        color: cor, weight: 2, opacity: 0.9,
        fillColor: cor, fillOpacity: 0.12,
        dashArray: '8, 5',
      }).addTo(map);
    }
  </script>
</body>
</html>`;
}
