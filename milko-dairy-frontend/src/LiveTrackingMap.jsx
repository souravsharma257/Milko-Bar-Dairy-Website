import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// Live tracking map - pickup point (vendor), drop point (customer),
// and the delivery boy's live moving position. Drawn with Leaflet
// (loaded via CDN, see public/index.html). Shared by:
//  - DeliveryDashboard (delivery boy sees his own position)
//  - App.jsx OrdersView (customer sees the delivery boy approaching)
// ============================================================
const LiveTrackingMap = ({ pickup, drop, deliveryBoyPosition }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.L) {
        setLeafletReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapRef.current) return;
    const L = window.L;
    const center = deliveryBoyPosition || pickup || drop || { lat: 27.8828, lng: 79.9088 };
    const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady]);

  // Update markers + route line whenever positions change
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    const map = mapRef.current;
    const bounds = [];

    if (pickup) {
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], {
          icon: L.divIcon({ className: '', html: '<div style="font-size:28px;">🏪</div>', iconSize: [28, 28], iconAnchor: [14, 28] })
        }).addTo(map).bindPopup(pickup.name || 'Pickup point');
      } else {
        pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng]);
      }
      bounds.push([pickup.lat, pickup.lng]);
    }

    if (drop) {
      if (!dropMarkerRef.current) {
        dropMarkerRef.current = L.marker([drop.lat, drop.lng], {
          icon: L.divIcon({ className: '', html: '<div style="font-size:28px;">🏠</div>', iconSize: [28, 28], iconAnchor: [14, 28] })
        }).addTo(map).bindPopup(drop.name || 'Drop point');
      } else {
        dropMarkerRef.current.setLatLng([drop.lat, drop.lng]);
      }
      bounds.push([drop.lat, drop.lng]);
    }

    if (deliveryBoyPosition) {
      if (!riderMarkerRef.current) {
        riderMarkerRef.current = L.marker([deliveryBoyPosition.lat, deliveryBoyPosition.lng], {
          icon: L.divIcon({ className: '', html: '<div style="font-size:28px;">🚴</div>', iconSize: [28, 28], iconAnchor: [14, 14] })
        }).addTo(map).bindPopup(deliveryBoyPosition.name || 'Delivery partner');
      } else {
        riderMarkerRef.current.setLatLng([deliveryBoyPosition.lat, deliveryBoyPosition.lng]);
      }
      bounds.push([deliveryBoyPosition.lat, deliveryBoyPosition.lng]);
    }

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    const routePoints = [pickup, deliveryBoyPosition, drop].filter(Boolean).map(p => [p.lat, p.lng]);
    if (routePoints.length >= 2) {
      routeLineRef.current = L.polyline(routePoints, { color: '#2563eb', weight: 3, dashArray: '6,8' }).addTo(map);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [pickup, drop, deliveryBoyPosition]);

  return (
    <div ref={mapContainerRef} className="w-full rounded-lg border-2 border-gray-200" style={{ height: '260px' }}>
      {!leafletReady && (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Loading map...</div>
      )}
    </div>
  );
};

export default LiveTrackingMap;