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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Share Tech Mono', monospace; }
    body { background: #0B0F0C; }
    #map { width: 100vw; height: 100vh; }
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10001;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.04) 2px,
        rgba(0,0,0,0.04) 4px
      );
    }

    .leaflet-popup-content-wrapper {
      background: rgba(7,9,15,0.92);
      border: 1px solid rgba(255,45,85,0.6);
      border-radius: 3px;
      color: #C2E8CE;
      font-family: monospace;
      font-size: 11px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(255,45,85,0.2);
    }
    .leaflet-popup-tip { background: rgba(7,9,15,0.92); }
    .leaflet-control-zoom {
      border: 1px solid rgba(0, 255, 102,0.3) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
    }
    .leaflet-control-zoom a {
      background: rgba(7,9,15,0.85) !important;
      color: #00FF66 !important;
      border-color: rgba(0, 255, 102,0.2) !important;
      font-family: monospace !important;
      font-weight: 900 !important;
    }
    .leaflet-control-zoom a:hover { background: rgba(0, 255, 102,0.15) !important; }
    .leaflet-control-scale-line {
      background: rgba(7,9,15,0.75);
      border: 1px solid rgba(0, 255, 102,0.4);
      border-top: 2px solid #00FF66;
      color: #00FF66;
      font-family: monospace;
      font-size: 9px;
      letter-spacing: 1px;
    }
    .leaflet-control-attribution {
      background: rgba(7,9,15,0.7) !important;
      color: #23502F !important;
      font-size: 8px;
    }
    .leaflet-control-attribution a { color: #23502F !important; }

    #legend {
      position: fixed;
      ${alvoFoco != null ? 'top: 12px;' : 'bottom: 48px;'}
      left: 12px;
      background: rgba(7,9,15,0.82);
      border: 1px solid rgba(0, 255, 102,0.15);
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
      border: 1px solid rgba(0, 255, 102,0.35);
      border-radius: 3px;
      color: #00FF66;
      font-family: monospace;
      font-size: 9px;
      letter-spacing: 1.5px;
      padding: 7px 11px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      white-space: nowrap;
    }
    #modeBtn:active { background: rgba(0, 255, 102,0.15); }
    #poiInfo {
      background: rgba(7,9,15,0.82);
      border: 1px solid rgba(0, 255, 102,0.15);
      border-radius: 3px;
      color: rgba(0, 255, 102,0.45);
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
      color: rgba(0, 255, 102,0.35);
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(0, 255, 102,0.08);
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
    .lg-dot-op  { background: #00FF66; box-shadow: 0 0 5px #00FF66; }
    .lg-dot-tgt { background: #ff2d55; box-shadow: 0 0 5px #ff2d55; }
    .lg-dot-sel { background: #ffd60a; box-shadow: 0 0 5px #ffd60a; }
    .lg-text {
      font-size: 9px;
      letter-spacing: 1.5px;
      color: #356B49;
    }
    .lg-text-op  { color: #00C24E; }
    .lg-text-sel { color: #c9a800; }
    .lg-divider {
      height: 1px;
      background: rgba(0, 255, 102,0.07);
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
      + '<circle cx="18" cy="18" r="15" stroke="#00FF66" stroke-width="1" fill="none" opacity="0.9"/>'
      + '<circle cx="18" cy="18" r="7" stroke="rgba(0,0,0,0.5)" stroke-width="3" fill="none"/>'
      + '<circle cx="18" cy="18" r="7" stroke="#00FF66" stroke-width="1" fill="none"/>'
      + '<circle cx="18" cy="18" r="2.5" stroke="rgba(0,0,0,0.6)" stroke-width="1.5" fill="#00FF66"/>'
      + '<line x1="18" y1="2" x2="18" y2="10" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="18" y1="2" x2="18" y2="10" stroke="#00FF66" stroke-width="1.5"/>'
      + '<line x1="18" y1="26" x2="18" y2="34" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="18" y1="26" x2="18" y2="34" stroke="#00FF66" stroke-width="1.5"/>'
      + '<line x1="2" y1="18" x2="10" y2="18" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="2" y1="18" x2="10" y2="18" stroke="#00FF66" stroke-width="1.5"/>'
      + '<line x1="26" y1="18" x2="34" y2="18" stroke="rgba(0,0,0,0.5)" stroke-width="3.5"/>'
      + '<line x1="26" y1="18" x2="34" y2="18" stroke="#00FF66" stroke-width="1.5"/>'
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
        '<div style="color:#00FF66;letter-spacing:2px;margin-bottom:4px;">◈ OPERADOR</div>'
        + '<div style="color:#356B49;">POSIÇÃO ATUAL</div>'
      );

    var salvos = ${marcadores};
    salvos.forEach(function(item) {
      var iconTgt = L.divIcon({ className:'', html: crosshairTgt, iconSize:[32,32], iconAnchor:[16,16], popupAnchor:[0,-18] });
      L.marker([item.latitude, item.longitude], { icon: iconTgt })
        .addTo(map)
        .bindPopup(
          '<div style="color:#ff2d55;letter-spacing:2px;margin-bottom:4px;">⊕ ALVO CONFIRMADO</div>'
          + '<div style="color:#C2E8CE;margin-bottom:2px;">' + item.label + '</div>'
          + '<div style="color:#356B49;font-size:10px;">' + item.endereco + '</div>'
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
          + '<div style="color:#C2E8CE;margin-bottom:2px;">' + label + '</div>'
          + '<div style="color:#356B49;font-size:10px;">' + endereco + '</div>'
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

    // ── Sistema de simulação ──────────────────────────────────────────────
    var flashEl = document.createElement('div');
    flashEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0;';
    document.body.appendChild(flashEl);

    function screenFlash(color, holdMs, fadeMs) {
      flashEl.style.transition = 'opacity 0.08s';
      flashEl.style.backgroundColor = color;
      flashEl.style.opacity = '1';
      setTimeout(function() {
        flashEl.style.transition = 'opacity ' + (fadeMs / 1000) + 's ease-out';
        flashEl.style.opacity = '0';
      }, holdMs);
    }

    function animRing(lat, lng, r0, r1, color, weight, op0, durMs, delayMs) {
      setTimeout(function() {
        var ring = L.circle([lat, lng], {
          radius: r0, color: color, weight: weight,
          opacity: op0, fillColor: color, fillOpacity: op0 * 0.18,
        }).addTo(map);
        var t0 = Date.now();
        var iv = setInterval(function() {
          var p = Math.min((Date.now() - t0) / durMs, 1);
          var ease = 1 - Math.pow(1 - p, 2);
          ring.setRadius(r0 + (r1 - r0) * ease);
          ring.setStyle({ opacity: op0 * (1 - p), fillOpacity: op0 * 0.18 * (1 - p) });
          if (p >= 1) { clearInterval(iv); map.removeLayer(ring); }
        }, 25);
      }, delayMs);
    }

    function animPulseRing(lat, lng, r, color, cycles, durMs, delayMs) {
      setTimeout(function() {
        var ring = L.circle([lat, lng], {
          radius: r, color: color, weight: 2, opacity: 0, fillOpacity: 0,
        }).addTo(map);
        var t0 = Date.now(); var totalDur = cycles * durMs;
        var iv = setInterval(function() {
          var p = Math.min((Date.now() - t0) / totalDur, 1);
          var cycle = ((Date.now() - t0) % durMs) / durMs;
          var op = Math.sin(cycle * Math.PI) * 0.7 * (1 - p);
          ring.setStyle({ opacity: op, fillOpacity: op * 0.15 });
          if (p >= 1) { clearInterval(iv); map.removeLayer(ring); }
        }, 30);
      }, delayMs);
    }

    function animDebris(lat, lng, count, maxR, color, durMs, delayMs) {
      setTimeout(function() {
        var pieces = [];
        for (var i = 0; i < count; i++) {
          var angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
          var dist = maxR * (0.4 + Math.random() * 0.6);
          var dlat = lat + (dist / 111320) * Math.cos(angle);
          var dlng = lng + (dist / (111320 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
          pieces.push(L.circleMarker([lat, lng], {
            radius: 2 + Math.random() * 2, color: color,
            fillColor: color, fillOpacity: 0.9, opacity: 0.9, weight: 1,
          }).addTo(map));
          (function(marker, targetLat, targetLng) {
            var t0 = Date.now(); var d = durMs * (0.6 + Math.random() * 0.4);
            var iv = setInterval(function() {
              var p = Math.min((Date.now() - t0) / d, 1);
              var ease = 1 - Math.pow(1 - p, 3);
              marker.setLatLng([lat + (targetLat - lat) * ease, lng + (targetLng - lng) * ease]);
              marker.setStyle({ opacity: 1 - p, fillOpacity: (1 - p) * 0.9 });
              if (p >= 1) { clearInterval(iv); map.removeLayer(marker); }
            }, 25);
          })(pieces[pieces.length - 1], dlat, dlng);
        }
      }, delayMs);
    }

    function animIncoming(lat, lng, color, travelMs, onArrival) {
      var angle = Math.random() * Math.PI * 2;
      var startLat = lat + 0.07 * Math.cos(angle);
      var startLng = lng + 0.07 * Math.sin(angle);
      map.setView([lat, lng], map.getZoom(), { animate: true, duration: 0.4 });
      var dot = L.circleMarker([startLat, startLng], {
        radius: 4, color: color, fillColor: '#ffffff', fillOpacity: 1, opacity: 1, weight: 2,
      }).addTo(map);
      var trail = L.polyline([[startLat, startLng]], {
        color: color, weight: 1.5, opacity: 0.5, dashArray: '4, 8',
      }).addTo(map);
      var t0 = Date.now();
      var iv = setInterval(function() {
        var p = Math.min((Date.now() - t0) / travelMs, 1);
        var ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        var clat = startLat + (lat - startLat) * ease;
        var clng = startLng + (lng - startLng) * ease;
        dot.setLatLng([clat, clng]);
        trail.addLatLng([clat, clng]);
        if (p >= 1) {
          clearInterval(iv);
          map.removeLayer(dot);
          setTimeout(function() { map.removeLayer(trail); }, 3000);
          if (onArrival) onArrival();
        }
      }, 20);
    }

    function animSmoke(lat, lng, r, durMs, delayMs) {
      setTimeout(function() {
        var smoke = L.circle([lat, lng], {
          radius: r * 0.3, color: '#888', weight: 1, opacity: 0.3,
          fillColor: '#555', fillOpacity: 0.12,
        }).addTo(map);
        var t0 = Date.now();
        var iv = setInterval(function() {
          var p = Math.min((Date.now() - t0) / durMs, 1);
          smoke.setRadius(r * 0.3 + r * 0.7 * p);
          smoke.setStyle({ opacity: 0.3 * (1 - p * 0.8), fillOpacity: 0.12 * (1 - p) });
          if (p >= 1) { clearInterval(iv); map.removeLayer(smoke); }
        }, 50);
      }, delayMs);
    }

    function animCrater(lat, lng, r, color, fadeMs, delayMs) {
      setTimeout(function() {
        var crater = L.circle([lat, lng], {
          radius: r, color: color, weight: 1, opacity: 0.55,
          fillColor: color, fillOpacity: 0.08, dashArray: '4, 6',
        }).addTo(map);
        var t0 = Date.now();
        var iv = setInterval(function() {
          var p = Math.min((Date.now() - t0) / fadeMs, 1);
          crater.setStyle({ opacity: 0.55 * (1 - p), fillOpacity: 0.08 * (1 - p) });
          if (p >= 1) { clearInterval(iv); map.removeLayer(crater); }
        }, 100);
      }, delayMs);
    }

    function animGranada(lat, lng) {
      map.setView([lat, lng], 18, { animate: true, duration: 0.4 });
      screenFlash('rgba(255,214,10,0.8)', 80, 350);
      animRing(lat, lng, 1,  15, '#ffffff', 3, 1.0,  500,   0);
      animRing(lat, lng, 1,  15, '#ffd60a', 2, 0.9,  900,   0);
      animRing(lat, lng, 8,  20, '#ff8800', 1, 0.5, 1200, 150);
      animDebris(lat, lng, 8, 12, '#ffd60a', 1000, 0);
      animSmoke(lat, lng, 18, 2500, 300);
      animPulseRing(lat, lng, 15, '#ffd60a', 3, 400, 100);
      animCrater(lat, lng, 5, '#ffd60a', 8000, 500);
    }

    function animRPG(lat, lng) {
      animIncoming(lat, lng, '#ff9500', 900, function() {
        screenFlash('rgba(255,149,0,0.6)', 120, 600);
        animRing(lat, lng, 2,  30,  '#ffffff', 3, 1.0,  700,   0);
        animRing(lat, lng, 2,  150, '#ff9500', 2, 0.9, 2000,   0);
        animRing(lat, lng, 2,  90,  '#ffcc44', 2, 0.7, 1500,   0);
        animRing(lat, lng, 50, 180, '#ff6600', 1, 0.45, 1800, 200);
        animDebris(lat, lng, 12, 100, '#ff9500', 1500, 0);
        animSmoke(lat, lng, 160, 4000, 400);
        animPulseRing(lat, lng, 80, '#ff9500', 4, 500, 200);
        animCrater(lat, lng, 60, '#ff9500', 10000, 500);
      });
    }

    function animCruise(lat, lng) {
      map.setView([lat, lng], 14, { animate: true, duration: 0.8 });
      screenFlash('rgba(255,96,0,0.3)', 100, 500);
      animIncoming(lat, lng, '#ff6000', 2000, function() {
        screenFlash('rgba(255,96,0,0.7)', 250, 1200);
        animRing(lat, lng, 5,  80,  '#ffffff', 3, 1.0,  900,    0);
        animRing(lat, lng, 5,  600, '#ff6000', 2, 0.9, 3500,    0);
        animRing(lat, lng, 5,  400, '#ffaa00', 2, 0.8, 2800,    0);
        animRing(lat, lng, 5,  200, '#ffdd88', 2, 0.7, 2000,    0);
        animRing(lat, lng, 80, 620, '#cc4400', 1, 0.4, 3000,  500);
        animRing(lat, lng, 200,650, '#882200', 1, 0.25,2800,  900);
        animDebris(lat, lng, 16, 300, '#ff6000', 2000, 0);
        animSmoke(lat, lng, 500, 6000, 600);
        animSmoke(lat, lng, 300, 5000, 1200);
        animPulseRing(lat, lng, 200, '#ff6000', 5, 600, 300);
        animCrater(lat, lng, 200, '#ff6000', 15000, 800);
      });
    }

    function animMOAB(lat, lng) {
      map.setView([lat, lng], 12, { animate: true, duration: 1.0 });
      animIncoming(lat, lng, '#ff2d55', 1800, function() {
        screenFlash('rgba(255,45,85,0.4)', 150, 800);
        setTimeout(function() { screenFlash('rgba(255,45,85,0.85)', 400, 2500); }, 300);
        animRing(lat, lng, 10,  300,  '#ffffff', 4, 1.0, 1200,    0);
        animRing(lat, lng, 10, 1600,  '#ff2d55', 3, 1.0, 5500,    0);
        animRing(lat, lng, 10, 1200,  '#ff6600', 2, 0.9, 4500,    0);
        animRing(lat, lng, 10,  800,  '#ffaa00', 2, 0.85,3500,    0);
        animRing(lat, lng, 10,  400,  '#ffdd88', 2, 0.8, 2500,    0);
        animRing(lat, lng, 400, 1700, '#ff2d55', 1, 0.45,3500,  700);
        animRing(lat, lng, 600, 1800, '#cc2244', 1, 0.3, 3000, 1100);
        animRing(lat, lng, 900, 1900, '#881133', 1, 0.2, 2800, 1600);
        animSmoke(lat, lng, 1400, 9000, 800);
        animSmoke(lat, lng, 900,  8000, 1500);
        animSmoke(lat, lng, 500,  7000, 2000);
        animPulseRing(lat, lng, 600, '#ff2d55', 6, 700, 400);
        animDebris(lat, lng, 20, 800, '#ff6600', 3000, 0);
        animCrater(lat, lng, 500, '#ff2d55', 20000, 1000);
        for (var i = 0; i < 4; i++) {
          animRing(lat, lng, 300 + i*80, 1700, '#ff4466', 1, 0.3, 2500, 800 + i*300);
        }
      });
    }

    function animNuclear(lat, lng) {
      map.setView([lat, lng], 10, { animate: true, duration: 1.2 });
      // Warning blinks during incoming travel
      screenFlash('rgba(200,0,255,0.25)', 150, 200);
      setTimeout(function() { screenFlash('rgba(200,0,255,0.35)', 150, 200); }, 400);
      setTimeout(function() { screenFlash('rgba(200,0,255,0.45)', 150, 200); }, 800);
      animIncoming(lat, lng, '#cc00ff', 1000, function() {
        // Detonação
        screenFlash('rgba(255,255,255,0.99)', 600, 3500);
        setTimeout(function() { screenFlash('rgba(255,100,0,0.35)', 300, 4000); }, 700);
        setTimeout(function() { screenFlash('rgba(200,0,255,0.2)', 200, 5000); }, 1200);
        // Fireball
        animRing(lat, lng, 20,   600,  '#ffffff', 4, 1.0, 1500,   200);
        animRing(lat, lng, 20,  3000,  '#ffcc00', 3, 0.95,4000,   0);
        // EMP — anel que expande ultrarrápido e desaparece
        animRing(lat, lng, 100,15000, 'rgba(200,200,255,1)', 1, 0.6, 2000, 300);
        // Shockwave principal
        animRing(lat, lng, 50, 12000,  '#cc00ff', 3, 0.9, 7000,   300);
        animRing(lat, lng, 50,  9500,  '#ff4400', 2, 0.8, 6200,   300);
        animRing(lat, lng, 500,12500,  '#cc00ff', 2, 0.5, 5500, 1000);
        animRing(lat, lng, 1200,13000, '#880088', 1, 0.35,5000, 1500);
        // Nuvens cogumelo (fumaça em camadas)
        animSmoke(lat, lng, 2000, 12000, 500);
        animSmoke(lat, lng, 4000, 11000, 1200);
        animSmoke(lat, lng, 6000, 10000, 2000);
        // Zona de fallout persistente
        setTimeout(function() {
          var fallout = L.circle([lat, lng], {
            radius: 4000, color: '#cc00ff', weight: 1,
            opacity: 0.35, fillColor: '#cc00ff', fillOpacity: 0.05,
            dashArray: '6, 10',
          }).addTo(map);
          var glow = L.circle([lat, lng], {
            radius: 800, color: '#ff6600', weight: 1,
            opacity: 0.5, fillColor: '#ff4400', fillOpacity: 0.08,
          }).addTo(map);
          var t = Date.now();
          var iv = setInterval(function() {
            var p = (Date.now() - t) / 10000;
            if (p >= 1) { clearInterval(iv); map.removeLayer(fallout); map.removeLayer(glow); return; }
            fallout.setStyle({ opacity: 0.35 * (1 - p), fillOpacity: 0.05 * (1 - p) });
            glow.setStyle({ opacity: 0.5 * (1 - p), fillOpacity: 0.08 * (1 - p) });
          }, 150);
        }, 5000);
        animPulseRing(lat, lng, 3000, '#cc00ff', 8, 800, 500);
        animCrater(lat, lng, 1500, '#cc00ff', 30000, 2000);
      });
    }

    // ── Sistema de áudio sintético ────────────────────────────────────────
    function getAudioCtx() {
      if (!window._actx) {
        try { window._actx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { return null; }
      }
      if (window._actx.state === 'suspended') window._actx.resume();
      return window._actx;
    }

    function getMaster(ctx) {
      if (!window._master) {
        var comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -12; comp.knee.value = 8;
        comp.ratio.value = 6; comp.attack.value = 0.020; comp.release.value = 0.15;
        comp.connect(ctx.destination);
        window._master = comp;
      }
      return window._master;
    }

    function mkNoise(ctx, dur) {
      var n = Math.ceil(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var s = ctx.createBufferSource(); s.buffer = buf; return s;
    }

    // ruído rosa (1/f) — muito mais natural que branco para explosões
    function mkPink(ctx, dur) {
      var n = Math.ceil(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (var i=0; i<n; i++) {
        var w = Math.random()*2-1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
      }
      var s = ctx.createBufferSource(); s.buffer = buf; return s;
    }

    function soundGranada() {
      var ctx = getAudioCtx(); if (!ctx) return;
      var out = getMaster(ctx), t = ctx.currentTime;
      // crack seco em três bandas
      [800, 1400, 2800].forEach(function(f, i) {
        var n = mkNoise(ctx, 0.18);
        var flt = ctx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = f; flt.Q.value = 0.8;
        var g = ctx.createGain(); g.gain.setValueAtTime(1.8 - i*0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.15);
        n.connect(flt); flt.connect(g); g.connect(out); n.start(t); n.stop(t+0.2);
      });
      // bass thud pequeno
      var b = ctx.createOscillator(); b.frequency.setValueAtTime(120, t); b.frequency.exponentialRampToValueAtTime(40, t+0.3);
      var bg = ctx.createGain(); bg.gain.setValueAtTime(0.9, t); bg.gain.exponentialRampToValueAtTime(0.001, t+0.35);
      b.connect(bg); bg.connect(out); b.start(t); b.stop(t+0.35);
      // estilhaços (burst de clicks aleatórios)
      for (var i=0; i<8; i++) {
        (function() {
          var dl = 0.05 + Math.random()*0.35;
          var sn = mkNoise(ctx, 0.04);
          var sf = ctx.createBiquadFilter(); sf.type = 'highpass'; sf.frequency.value = 3000 + Math.random()*4000;
          var sg = ctx.createGain(); sg.gain.setValueAtTime(0.15 + Math.random()*0.25, t+dl); sg.gain.exponentialRampToValueAtTime(0.001, t+dl+0.03);
          sn.connect(sf); sf.connect(sg); sg.connect(out); sn.start(t+dl); sn.stop(t+dl+0.05);
        })();
      }
      // ring metálico harmônico descendente
      [880, 1320, 1760].forEach(function(freq, i) {
        var o = ctx.createOscillator(); o.type = i === 0 ? 'sine' : 'triangle';
        o.frequency.setValueAtTime(freq, t+0.04); o.frequency.exponentialRampToValueAtTime(freq*0.18, t+2.2);
        var rg = ctx.createGain(); rg.gain.setValueAtTime(0.18 - i*0.04, t+0.04); rg.gain.exponentialRampToValueAtTime(0.001, t+2.0);
        o.connect(rg); rg.connect(out); o.start(t+0.04); o.stop(t+2.2);
      });
    }

    function soundRPG() {
      var ctx = getAudioCtx(); if (!ctx) return;
      var out = getMaster(ctx), t = ctx.currentTime, hit = t + 1.1;
      // whoosh Doppler — frequência sobe, passa, e cai
      var wn = mkPink(ctx, 1.3);
      var wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.Q.value = 1.5;
      wf.frequency.setValueAtTime(200, t); wf.frequency.linearRampToValueAtTime(1800, hit-0.15); wf.frequency.exponentialRampToValueAtTime(400, hit);
      var wg = ctx.createGain(); wg.gain.setValueAtTime(0.001, t); wg.gain.linearRampToValueAtTime(0.7, hit-0.12); wg.gain.linearRampToValueAtTime(0.001, hit+0.05);
      wn.connect(wf); wf.connect(wg); wg.connect(out); wn.start(t); wn.stop(hit+0.1);
      // crack de impacto
      var ck = mkNoise(ctx, 0.06);
      var ckf = ctx.createBiquadFilter(); ckf.type = 'bandpass'; ckf.frequency.value = 2200; ckf.Q.value = 0.5;
      var ckg = ctx.createGain(); ckg.gain.setValueAtTime(3.5, hit); ckg.gain.exponentialRampToValueAtTime(0.001, hit+0.06);
      ck.connect(ckf); ckf.connect(ckg); ckg.connect(out); ck.start(hit); ck.stop(hit+0.07);
      // explosão em duas camadas (alta + grave)
      [[2200, 0.4, 2.5], [600, 0.15, 4.0]].forEach(function(cfg) {
        var en = mkPink(ctx, cfg[2]);
        var ef = ctx.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.setValueAtTime(cfg[0], hit); ef.frequency.exponentialRampToValueAtTime(80, hit+cfg[2]*0.9);
        var eg = ctx.createGain(); eg.gain.setValueAtTime(cfg[1]*8, hit); eg.gain.exponentialRampToValueAtTime(0.001, hit+cfg[2]);
        en.connect(ef); ef.connect(eg); eg.connect(out); en.start(hit); en.stop(hit+cfg[2]+0.05);
      });
      // bass thud
      var b = ctx.createOscillator(); b.frequency.setValueAtTime(95, hit); b.frequency.exponentialRampToValueAtTime(22, hit+0.8);
      var bg = ctx.createGain(); bg.gain.setValueAtTime(1.8, hit); bg.gain.exponentialRampToValueAtTime(0.001, hit+0.8);
      b.connect(bg); bg.connect(out); b.start(hit); b.stop(hit+0.85);
      // debris (clicks de fragmentos voando)
      for (var i=0; i<12; i++) {
        (function() {
          var dl = hit + 0.05 + Math.random()*0.9;
          var sn = mkNoise(ctx, 0.035);
          var sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1500 + Math.random()*3500;
          var sg = ctx.createGain(); sg.gain.setValueAtTime(0.12 + Math.random()*0.2, dl); sg.gain.exponentialRampToValueAtTime(0.001, dl+0.03);
          sn.connect(sf); sf.connect(sg); sg.connect(out); sn.start(dl); sn.stop(dl+0.04);
        })();
      }
    }

    function soundCruise() {
      var ctx = getAudioCtx(); if (!ctx) return;
      var out = getMaster(ctx), t = ctx.currentTime, hit = t + 2.5;
      // turbina com LFO (variação de rpm torna mais realista)
      [110, 220, 330, 440].forEach(function(freq) {
        var o = ctx.createOscillator(); o.type = 'sawtooth';
        var lfo = ctx.createOscillator(); lfo.frequency.value = 3.5 + Math.random()*2;
        var lfoG = ctx.createGain(); lfoG.gain.value = freq * 0.04;
        lfo.connect(lfoG); lfoG.connect(o.frequency);
        o.frequency.setValueAtTime(freq*0.55, t); o.frequency.linearRampToValueAtTime(freq*1.7, hit-0.2);
        var og = ctx.createGain(); og.gain.setValueAtTime(0.001, t); og.gain.linearRampToValueAtTime(0.09, t+0.5); og.gain.linearRampToValueAtTime(0.001, hit);
        var hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 80;
        o.connect(hpf); hpf.connect(og); og.connect(out);
        lfo.start(t); o.start(t); lfo.stop(hit+0.1); o.stop(hit+0.1);
      });
      // crack de impacto
      var ck = mkNoise(ctx, 0.05);
      var ckf = ctx.createBiquadFilter(); ckf.type = 'bandpass'; ckf.frequency.value = 2800; ckf.Q.value = 0.4;
      var ckg = ctx.createGain(); ckg.gain.setValueAtTime(5.0, hit); ckg.gain.exponentialRampToValueAtTime(0.001, hit+0.05);
      ck.connect(ckf); ckf.connect(ckg); ckg.connect(out); ck.start(hit); ck.stop(hit+0.06);
      // explosão principal em três camadas
      [[4000, 0.6, 5.0], [800, 0.25, 6.5], [150, 0.12, 4.0]].forEach(function(cfg) {
        var en = mkPink(ctx, cfg[2]+0.1);
        var ef = ctx.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.setValueAtTime(cfg[0], hit); ef.frequency.exponentialRampToValueAtTime(60, hit+cfg[2]*0.85);
        var eg = ctx.createGain(); eg.gain.setValueAtTime(cfg[1]*7, hit); eg.gain.exponentialRampToValueAtTime(0.001, hit+cfg[2]);
        en.connect(ef); ef.connect(eg); eg.connect(out); en.start(hit); en.stop(hit+cfg[2]+0.1);
      });
      // sub bass duplo (ogiva + combustível)
      [[45, 2.5], [28, 3.5]].forEach(function(p) {
        var b = ctx.createOscillator(); b.frequency.setValueAtTime(p[0], hit); b.frequency.exponentialRampToValueAtTime(p[0]*0.3, hit+p[1]);
        var bg = ctx.createGain(); bg.gain.setValueAtTime(2.2, hit); bg.gain.exponentialRampToValueAtTime(0.001, hit+p[1]);
        b.connect(bg); bg.connect(out); b.start(hit); b.stop(hit+p[1]+0.1);
      });
      // segundo boom (combustível residual)
      setTimeout(function() {
        var c = ctx.currentTime;
        var s2 = mkPink(ctx, 3.0);
        var f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.setValueAtTime(2000, c); f2.frequency.exponentialRampToValueAtTime(100, c+2.8);
        var g2 = ctx.createGain(); g2.gain.setValueAtTime(2.0, c); g2.gain.exponentialRampToValueAtTime(0.001, c+3.0);
        s2.connect(f2); f2.connect(g2); g2.connect(out); s2.start(c); s2.stop(c+3.0);
      }, 600);
    }

    function soundMOAB() {
      var ctx = getAudioCtx(); if (!ctx) return;
      var out = getMaster(ctx), t = ctx.currentTime, hit = t + 2.2;
      // assobio icônico de queda — oscillator pitch drop (muito mais convincente que ruído filtrado)
      var wOsc = ctx.createOscillator(); wOsc.type = 'sine';
      wOsc.frequency.setValueAtTime(1200, t); wOsc.frequency.exponentialRampToValueAtTime(120, hit-0.1);
      var wOscG = ctx.createGain(); wOscG.gain.setValueAtTime(0.001, t); wOscG.gain.linearRampToValueAtTime(0.6, t+0.3); wOscG.gain.linearRampToValueAtTime(0.001, hit);
      wOsc.connect(wOscG); wOscG.connect(out); wOsc.start(t); wOsc.stop(hit+0.05);
      // camada de vento no assobio
      var wN = mkPink(ctx, 2.3);
      var wF = ctx.createBiquadFilter(); wF.type = 'bandpass'; wF.frequency.setValueAtTime(600, t); wF.frequency.exponentialRampToValueAtTime(180, hit);
      var wG = ctx.createGain(); wG.gain.setValueAtTime(0.15, t); wG.gain.linearRampToValueAtTime(0.5, hit-0.2); wG.gain.linearRampToValueAtTime(0.001, hit);
      wN.connect(wF); wF.connect(wG); wG.connect(out); wN.start(t); wN.stop(hit+0.05);
      // crack de impacto
      var ck = mkNoise(ctx, 0.05);
      var ckf = ctx.createBiquadFilter(); ckf.type = 'bandpass'; ckf.frequency.value = 2000; ckf.Q.value = 0.3;
      var ckg = ctx.createGain(); ckg.gain.setValueAtTime(6.0, hit); ckg.gain.exponentialRampToValueAtTime(0.001, hit+0.05);
      ck.connect(ckf); ckf.connect(ckg); ckg.connect(out); ck.start(hit); ck.stop(hit+0.06);
      // BOOM — punch transiente: sweep 180→28Hz + presença em médios (audível em qualquer caixa)
      var boom = ctx.createOscillator(); boom.frequency.setValueAtTime(180, hit); boom.frequency.exponentialRampToValueAtTime(28, hit+0.18);
      var boomG = ctx.createGain(); boomG.gain.setValueAtTime(4.0, hit); boomG.gain.exponentialRampToValueAtTime(0.001, hit+0.55);
      boom.connect(boomG); boomG.connect(ctx.destination); boom.start(hit); boom.stop(hit+0.6);
      var boomMid = ctx.createOscillator(); boomMid.frequency.setValueAtTime(380, hit); boomMid.frequency.exponentialRampToValueAtTime(90, hit+0.25);
      var boomMidG = ctx.createGain(); boomMidG.gain.setValueAtTime(2.5, hit); boomMidG.gain.exponentialRampToValueAtTime(0.001, hit+0.4);
      boomMid.connect(boomMidG); boomMidG.connect(ctx.destination); boomMid.start(hit); boomMid.stop(hit+0.45);
      var boomN = mkPink(ctx, 0.65);
      var boomF = ctx.createBiquadFilter(); boomF.type = 'bandpass'; boomF.frequency.value = 280; boomF.Q.value = 0.6;
      var boomNG = ctx.createGain(); boomNG.gain.setValueAtTime(5.0, hit); boomNG.gain.exponentialRampToValueAtTime(0.001, hit+0.65);
      boomN.connect(boomF); boomF.connect(boomNG); boomNG.connect(ctx.destination); boomN.start(hit); boomN.stop(hit+0.7);
      // burst de ruído massivo em três camadas
      [[5000, 0.8, 9.0], [1200, 0.4, 10.0], [300, 0.2, 8.0]].forEach(function(cfg) {
        var en = mkPink(ctx, cfg[2]+0.1);
        var ef = ctx.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.setValueAtTime(cfg[0], hit); ef.frequency.exponentialRampToValueAtTime(40, hit+cfg[2]*0.92);
        var eg = ctx.createGain(); eg.gain.setValueAtTime(cfg[1]*5, hit); eg.gain.exponentialRampToValueAtTime(0.001, hit+cfg[2]);
        en.connect(ef); ef.connect(eg); eg.connect(out); en.start(hit); en.stop(hit+cfg[2]+0.1);
      });
      // sub bass stack ultra-grave
      [22, 35, 50, 70].forEach(function(freq) {
        var b = ctx.createOscillator(); b.frequency.setValueAtTime(freq, hit); b.frequency.exponentialRampToValueAtTime(freq*0.3, hit+4.5);
        var bg = ctx.createGain(); bg.gain.setValueAtTime(2.0, hit); bg.gain.exponentialRampToValueAtTime(0.001, hit+4.5);
        b.connect(bg); bg.connect(out); b.start(hit); b.stop(hit+4.6);
      });
      // 1ª onda de pressão
      setTimeout(function() {
        var c = ctx.currentTime;
        var pn = mkPink(ctx, 3.0);
        var pf = ctx.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.setValueAtTime(400, c); pf.frequency.exponentialRampToValueAtTime(60, c+2.8);
        var pg = ctx.createGain(); pg.gain.setValueAtTime(3.5, c); pg.gain.exponentialRampToValueAtTime(0.001, c+3.0);
        pn.connect(pf); pf.connect(pg); pg.connect(out); pn.start(c); pn.stop(c+3.0);
      }, 1200);
      // 2ª onda de pressão (eco distante)
      setTimeout(function() {
        var c = ctx.currentTime;
        var pn = mkPink(ctx, 2.0);
        var pf = ctx.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.setValueAtTime(200, c); pf.frequency.exponentialRampToValueAtTime(40, c+1.8);
        var pg = ctx.createGain(); pg.gain.setValueAtTime(1.8, c); pg.gain.exponentialRampToValueAtTime(0.001, c+2.0);
        pn.connect(pf); pf.connect(pg); pg.connect(out); pn.start(c); pn.stop(c+2.0);
      }, 2800);
    }

    function soundNuclear() {
      var ctx = getAudioCtx(); if (!ctx) return;
      var out = getMaster(ctx), t = ctx.currentTime;
      var hit = t + 1.5;    // impacto / flash
      var blast = hit + 0.12; // onda de choque
      var wind = blast + 1.2; // vento térmico

      // ── FASE 1: Sirene de alerta ────────────────────────────────────────
      var sirenOsc = ctx.createOscillator(); sirenOsc.type = 'sawtooth'; sirenOsc.frequency.value = 820;
      var sirenLFO = ctx.createOscillator(); sirenLFO.frequency.value = 1.8;
      var sirenLFOG = ctx.createGain(); sirenLFOG.gain.value = 360;
      sirenLFO.connect(sirenLFOG); sirenLFOG.connect(sirenOsc.frequency);
      var sirenG = ctx.createGain(); sirenG.gain.setValueAtTime(0.0, t); sirenG.gain.linearRampToValueAtTime(0.14, t+0.25); sirenG.gain.setValueAtTime(0.14, hit-0.18); sirenG.gain.linearRampToValueAtTime(0.0, hit-0.05);
      sirenOsc.connect(sirenG); sirenG.connect(out);
      sirenLFO.start(t); sirenOsc.start(t); sirenLFO.stop(hit); sirenOsc.stop(hit);

      // ── FASE 2: Beeps de alerta escalonados ────────────────────────────
      [0, 0.28, 0.52, 0.72, 0.90].forEach(function(delay, i) {
        var beep = ctx.createOscillator(); beep.type = 'square'; beep.frequency.value = 680 + i*170;
        var bg = ctx.createGain(); bg.gain.setValueAtTime(0.35, t+delay); bg.gain.exponentialRampToValueAtTime(0.001, t+delay+0.10);
        beep.connect(bg); bg.connect(out); beep.start(t+delay); beep.stop(t+delay+0.13);
      });

      // ── FASE 3: Screech do míssil + rumble crescente ───────────────────
      [1, 1.5, 2].forEach(function(h) {
        var mo = ctx.createOscillator(); mo.type = 'sawtooth';
        mo.frequency.setValueAtTime(280*h, t+0.3); mo.frequency.exponentialRampToValueAtTime(4200*h, hit);
        var mg = ctx.createGain(); mg.gain.setValueAtTime(0.001, t+0.3); mg.gain.linearRampToValueAtTime(0.18/h, hit-0.06); mg.gain.linearRampToValueAtTime(0.001, hit+0.01);
        mo.connect(mg); mg.connect(out); mo.start(t+0.3); mo.stop(hit+0.03);
      });
      var preN = mkPink(ctx, hit-t+0.1);
      var preF = ctx.createBiquadFilter(); preF.type = 'lowpass'; preF.frequency.value = 100;
      var preG = ctx.createGain(); preG.gain.setValueAtTime(0.001, t); preG.gain.exponentialRampToValueAtTime(2.0, hit-0.05); preG.gain.linearRampToValueAtTime(0.001, hit+0.02);
      preN.connect(preF); preF.connect(preG); preG.connect(out); preN.start(t); preN.stop(hit+0.05);

      // ── FASE 4: Flash EMP ──────────────────────────────────────────────
      var ek = mkNoise(ctx, 0.15);
      var ekg = ctx.createGain(); ekg.gain.setValueAtTime(9.0, hit); ekg.gain.exponentialRampToValueAtTime(0.001, hit+0.15);
      ek.connect(ekg); ekg.connect(ctx.destination); ek.start(hit); ek.stop(hit+0.16);

      // ── FASE 5: BOOM — onda de choque (3 sweeps + corpo de ruído) ──────
      // sweeps: [freqInicial, freqFinal, duração, gain]
      [[260, 20, 0.13, 5.0], [170, 16, 0.20, 4.2], [95, 12, 0.32, 3.2]].forEach(function(p) {
        var bm = ctx.createOscillator(); bm.frequency.setValueAtTime(p[0], blast); bm.frequency.exponentialRampToValueAtTime(p[1], blast+p[2]);
        var bmG = ctx.createGain(); bmG.gain.setValueAtTime(p[3], blast); bmG.gain.exponentialRampToValueAtTime(0.001, blast+0.75);
        bm.connect(bmG); bmG.connect(ctx.destination); bm.start(blast); bm.stop(blast+0.8);
      });
      // presença de médios (audível em qualquer caixa)
      var bmMid = ctx.createOscillator(); bmMid.frequency.setValueAtTime(550, blast); bmMid.frequency.exponentialRampToValueAtTime(70, blast+0.22);
      var bmMidG = ctx.createGain(); bmMidG.gain.setValueAtTime(4.0, blast); bmMidG.gain.exponentialRampToValueAtTime(0.001, blast+0.38);
      bmMid.connect(bmMidG); bmMidG.connect(ctx.destination); bmMid.start(blast); bmMid.stop(blast+0.42);
      // corpo de ruído do BOOM
      var bmN = mkPink(ctx, 1.1);
      var bmF = ctx.createBiquadFilter(); bmF.type = 'bandpass'; bmF.frequency.value = 340; bmF.Q.value = 0.5;
      var bmNG = ctx.createGain(); bmNG.gain.setValueAtTime(8.0, blast); bmNG.gain.exponentialRampToValueAtTime(0.001, blast+1.1);
      bmN.connect(bmF); bmF.connect(bmNG); bmNG.connect(ctx.destination); bmN.start(blast); bmN.stop(blast+1.15);

      // ── FASE 6: Onda de pressão — ruído em 4 camadas de frequência ─────
      [[7000, 1.1, 15.0], [1800, 0.55, 17.0], [450, 0.28, 13.0], [90, 0.14, 11.0]].forEach(function(cfg) {
        var en = mkPink(ctx, cfg[2]+0.2);
        var ef = ctx.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.setValueAtTime(cfg[0], blast); ef.frequency.exponentialRampToValueAtTime(28, blast+cfg[2]*0.88);
        var eg = ctx.createGain(); eg.gain.setValueAtTime(cfg[1]*6, blast); eg.gain.exponentialRampToValueAtTime(0.001, blast+cfg[2]);
        en.connect(ef); ef.connect(eg); eg.connect(out); en.start(blast); en.stop(blast+cfg[2]+0.2);
      });

      // ── FASE 7: Sub bass ultra-grave sustentado (terra vibrando) ───────
      [13, 20, 32, 48, 68].forEach(function(freq) {
        var r = ctx.createOscillator(); r.frequency.setValueAtTime(freq, blast);
        var rg = ctx.createGain(); rg.gain.setValueAtTime(3.0, blast); rg.gain.exponentialRampToValueAtTime(0.001, blast+14.0);
        r.connect(rg); rg.connect(out); r.start(blast); r.stop(blast+14.1);
      });

      // ── FASE 8: Vento térmico (sucção + expulsão de ar) ────────────────
      setTimeout(function() {
        var c = ctx.currentTime;
        var wN = mkPink(ctx, 6.0);
        var wF = ctx.createBiquadFilter(); wF.type = 'bandpass'; wF.frequency.setValueAtTime(1400, c); wF.frequency.exponentialRampToValueAtTime(180, c+5.5);
        var wG = ctx.createGain(); wG.gain.setValueAtTime(0.001, c); wG.gain.linearRampToValueAtTime(2.2, c+0.4); wG.gain.linearRampToValueAtTime(0.001, c+6.0);
        wN.connect(wF); wF.connect(wG); wG.connect(out); wN.start(c); wN.stop(c+6.1);
      }, Math.round((wind-t)*1000));

      // ── FASE 9: Tinnitus + chuva de debris ─────────────────────────────
      setTimeout(function() {
        var c = ctx.currentTime;
        [5400, 4200, 7100].forEach(function(f, i) {
          var r = ctx.createOscillator(); r.type = 'sine'; r.frequency.value = f;
          var rg = ctx.createGain(); rg.gain.setValueAtTime(0.0, c+i*0.12); rg.gain.linearRampToValueAtTime(0.15, c+i*0.12+0.2); rg.gain.exponentialRampToValueAtTime(0.001, c+7.0);
          r.connect(rg); rg.connect(out); r.start(c+i*0.12); r.stop(c+7.1);
        });
        for (var i=0; i<24; i++) {
          (function() {
            var dl = Math.random()*5.0;
            var sn = mkNoise(ctx, 0.04);
            var sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 600+Math.random()*3500;
            var sg = ctx.createGain(); sg.gain.setValueAtTime(0.06+Math.random()*0.16, c+dl); sg.gain.exponentialRampToValueAtTime(0.001, c+dl+0.04);
            sn.connect(sf); sf.connect(sg); sg.connect(out); sn.start(c+dl); sn.stop(c+dl+0.05);
          })();
        }
      }, Math.round((blast+0.6-t)*1000));

      // ── FASE 10: Ondas de pressão secundárias (3 reflexos) ─────────────
      [2200, 4800, 9000].forEach(function(ms, i) {
        setTimeout(function() {
          var c = ctx.currentTime, gain = [4.0, 2.2, 1.0][i];
          var pn = mkPink(ctx, 4.5);
          var pf = ctx.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.setValueAtTime(600, c); pf.frequency.exponentialRampToValueAtTime(35, c+4.2);
          var pg = ctx.createGain(); pg.gain.setValueAtTime(gain, c); pg.gain.exponentialRampToValueAtTime(0.001, c+4.5);
          pn.connect(pf); pf.connect(pg); pg.connect(out); pn.start(c); pn.stop(c+4.6);
        }, ms);
      });

      // ── FASE 11: Rumble de fundo (solo vibrando por ~20s) ──────────────
      setTimeout(function() {
        var c = ctx.currentTime;
        var gN = mkPink(ctx, 20.0);
        var gF = ctx.createBiquadFilter(); gF.type = 'lowpass'; gF.frequency.value = 55;
        var gG = ctx.createGain(); gG.gain.setValueAtTime(1.5, c); gG.gain.exponentialRampToValueAtTime(0.001, c+20.0);
        gN.connect(gF); gF.connect(gG); gG.connect(out); gN.start(c); gN.stop(c+20.1);
      }, Math.round((blast+0.4-t)*1000));
    }

    function simularAtaque(armaId, lat, lng) {
      var fn  = { granada: animGranada,  rpg: animRPG,  cruise: animCruise,  moab: animMOAB,  nuclear: animNuclear  };
      var snd = { granada: soundGranada, rpg: soundRPG, cruise: soundCruise, moab: soundMOAB, nuclear: soundNuclear };
      if (fn[armaId])  fn[armaId](lat, lng);
      if (snd[armaId]) snd[armaId]();
    }
  </script>
</body>
</html>`;
}
