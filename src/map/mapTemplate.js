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
    body { background: #0B0F0C; }
    #map { width: 100vw; height: 100vh; }

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
      var startLat = lat + 0.06; var startLng = lng - 0.02;
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

    function animGranada(lat, lng) {
      map.setView([lat, lng], 18, { animate: true, duration: 0.4 });
      screenFlash('rgba(255,214,10,0.8)', 80, 350);
      animRing(lat, lng, 1,  15, '#ffffff', 3, 1.0,  500,   0);
      animRing(lat, lng, 1,  15, '#ffd60a', 2, 0.9,  900,   0);
      animRing(lat, lng, 8,  20, '#ff8800', 1, 0.5, 1200, 150);
      animDebris(lat, lng, 8, 12, '#ffd60a', 1000, 0);
      animSmoke(lat, lng, 18, 2500, 300);
      animPulseRing(lat, lng, 15, '#ffd60a', 3, 400, 100);
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
      });
    }

    function animMOAB(lat, lng) {
      map.setView([lat, lng], 12, { animate: true, duration: 1.0 });
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
      // ondas de sobrepressão em sequência
      for (var i = 0; i < 4; i++) {
        animRing(lat, lng, 300 + i*80, 1700, '#ff4466', 1, 0.3, 2500, 800 + i*300);
      }
    }

    function animNuclear(lat, lng) {
      map.setView([lat, lng], 10, { animate: true, duration: 1.2 });
      // Warning blinks
      screenFlash('rgba(200,0,255,0.25)', 150, 200);
      setTimeout(function() { screenFlash('rgba(200,0,255,0.35)', 150, 200); }, 400);
      setTimeout(function() { screenFlash('rgba(200,0,255,0.45)', 150, 200); }, 800);
      // Detonação
      setTimeout(function() {
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
      }, 1000);
    }

    function simularAtaque(armaId, lat, lng) {
      var fn = { granada: animGranada, rpg: animRPG, cruise: animCruise, moab: animMOAB, nuclear: animNuclear };
      if (fn[armaId]) fn[armaId](lat, lng);
    }
  </script>
</body>
</html>`;
}
