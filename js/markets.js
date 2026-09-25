// ====================================================================
// MarketLink – eGreen Basket: Markets Directory & Leaflet Map Engine
// OpenStreetMap + Leaflet.js interactive maps & filtering
// ====================================================================

const MarketsView = {
    map: null,
    markers: {},
    allMarkets: [],

    async init() {
        this.allMarkets = await DB.getMarkets();
        this.initMap();
        this.renderMarkets(this.allMarkets);
        this.setupFilters();
    },

    initMap() {
        const mapContainer = document.getElementById('market-map');
        if (!mapContainer || !window.L) return;

        // Center around Pakistan
        this.map = L.map('market-map').setView([30.8, 71.5], 6);

        // OpenStreetMap Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | MarketLink'
        }).addTo(this.map);

        // Custom Green Map Marker Icon
        const greenIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="background-color: #2e7d32; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; font-size: 16px;">
                    <i class="bi bi-shop"></i>
                   </div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
            popupAnchor: [0, -32]
        });

        // Add markers for all markets
        this.allMarkets.forEach(m => {
            if (m.latitude && m.longitude) {
                const marker = L.marker([m.latitude, m.longitude], { icon: greenIcon }).addTo(this.map);
                const popupContent = `
                    <div style="min-width: 200px; padding: 4px;">
                        <h6 style="font-weight: 700; color: #1b5e20; margin-bottom: 4px;">${m.name}</h6>
                        <p style="font-size: 12px; color: #555; margin-bottom: 6px;">
                            <i class="bi bi-geo-alt-fill text-danger"></i> ${m.address}
                        </p>
                        <p style="font-size: 12px; margin-bottom: 8px;">
                            <strong>Days:</strong> ${m.operating_days}<br>
                            <strong>Time:</strong> ${m.opening_time} - ${m.closing_time}
                        </p>
                        <a href="farmers.html?market=${m.id}" class="btn btn-sm btn-primary w-100 text-white" style="font-size: 11px; padding: 3px 8px;">
                            Browse ${m.farmer_count || 12} Farmers
                        </a>
                    </div>
                `;
                marker.bindPopup(popupContent);
                this.markers[m.id] = marker;
            }
        });
    },

    renderMarkets(markets) {
        const container = document.getElementById('markets-grid');
        const countEl = document.getElementById('market-count-badge');
        if (!container) return;

        if (countEl) countEl.textContent = `${markets.length} Markets Found`;

        if (markets.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <h5 class="fw-bold mt-2">No Markets Match Your Filter</h5>
                    <p class="text-muted">Try clearing the search or day filter.</p>
                </div>
            `;
            return;
        }

        let html = '';
        markets.forEach(m => {
            html += `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 card-hover-lift">
                    <div style="position: relative; height: 190px; overflow: hidden;">
                        <img src="${m.image_url}" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${m.name}">
                        <span class="badge bg-success position-absolute top-0 start-0 m-3 px-3 py-2 shadow-sm">
                            <i class="bi bi-calendar3 me-1"></i> ${m.operating_days}
                        </span>
                    </div>
                    <div class="card-body d-flex flex-column p-4">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0 text-dark">${m.name}</h5>
                        </div>
                        <p class="text-muted small mb-3">
                            <i class="bi bi-geo-alt-fill text-danger me-1"></i> ${m.address}
                        </p>
                        <p class="small text-secondary mb-3 flex-grow-1">
                            ${m.description || 'Organic farmers market offering fresh local harvest directly from registered growers.'}
                        </p>
                        
                        <div class="bg-light p-2 rounded-3 mb-3 small d-flex justify-content-between align-items-center">
                            <div>
                                <i class="bi bi-clock-fill text-muted me-1"></i>
                                <span>${m.opening_time} - ${m.closing_time}</span>
                            </div>
                            <span class="badge bg-white text-dark border">
                                <i class="bi bi-people-fill text-success me-1"></i> ${m.farmer_count || 12} Farmers
                            </span>
                        </div>

                        <div class="d-flex gap-2 mt-auto">
                            <a href="farmers.html?market=${m.id}" class="btn btn-outline-primary btn-sm flex-grow-1">
                                View Farmers
                            </a>
                            <button onclick="MarketsView.panToMarket('${m.id}')" class="btn btn-earthy btn-sm" title="View on Map">
                                <i class="bi bi-geo-alt"></i> Map
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        });

        container.innerHTML = html;
    },

    panToMarket(marketId) {
        const marker = this.markers[marketId];
        const m = this.allMarkets.find(item => item.id === marketId);
        if (marker && this.map) {
            document.getElementById('market-map').scrollIntoView({ behavior: 'smooth' });
            this.map.setView([m.latitude, m.longitude], 13);
            marker.openPopup();
        }
    },

    setupFilters() {
        const searchInput = document.getElementById('marketSearchInput');
        const daySelect = document.getElementById('marketDaySelect');
        const citySelect = document.getElementById('marketCitySelect');

        const apply = () => {
            const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
            const day = daySelect ? daySelect.value : 'all';
            const city = citySelect ? citySelect.value : 'all';

            const filtered = this.allMarkets.filter(m => {
                const matchesSearch = !query || 
                    m.name.toLowerCase().includes(query) || 
                    m.address.toLowerCase().includes(query);
                
                const matchesDay = day === 'all' || m.operating_days.toLowerCase().includes(day.toLowerCase());
                const matchesCity = city === 'all' || (m.city && m.city.toLowerCase() === city.toLowerCase()) || m.address.toLowerCase().includes(city.toLowerCase());

                return matchesSearch && matchesDay && matchesCity;
            });

            this.renderMarkets(filtered);
        };

        if (searchInput) searchInput.addEventListener('input', apply);
        if (daySelect) daySelect.addEventListener('change', apply);
        if (citySelect) citySelect.addEventListener('change', apply);
    }
};

window.MarketsView = MarketsView;
