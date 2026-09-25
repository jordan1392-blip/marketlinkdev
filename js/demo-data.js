// ====================================================================
// MarketLink – eGreen Basket: Realistic Pakistani Agricultural Demo Data
// 8 Farmers, 5 Markets, 30 Products, 10 Customers, Sample Orders & Reviews
// Currency: PKR (Pakistani Rupee)
// ====================================================================

const DEMO_CATEGORIES = [
    { id: 'cat-veg', name: 'Vegetables', description: 'Freshly harvested organic vegetables', icon: 'bi-flower1' },
    { id: 'cat-fruit', name: 'Fruits', description: 'Sweet and seasonal orchard fruits', icon: 'bi-apple' },
    { id: 'cat-dairy', name: 'Dairy', description: 'Pure milk, desi ghee, and artisanal cheese', icon: 'bi-cup-straw' },
    { id: 'cat-bakery', name: 'Bakery', description: 'Traditional breads, buns, and rusks', icon: 'bi-egg-fried' },
    { id: 'cat-eggs', name: 'Eggs', description: 'Free-range desi and country fresh eggs', icon: 'bi-egg' },
    { id: 'cat-honey', name: 'Honey', description: 'Raw, unpasteurized natural mountain honey', icon: 'bi-droplet-half' },
    { id: 'cat-other', name: 'Other', description: 'Cold-pressed oils, herbs, and dried goods', icon: 'bi-boxes' }
];

const DEMO_MARKETS = [
    {
        id: 'mkt-isb-f6',
        name: 'Islamabad F-6 Super Market Organic Bazaar',
        address: 'School Road, Super Market, Sector F-6, Islamabad',
        city: 'Islamabad',
        operating_days: 'Friday, Saturday',
        opening_time: '08:00',
        closing_time: '18:00',
        latitude: 33.7297,
        longitude: 73.0746,
        map_provider: 'OpenStreetMap',
        image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
        description: 'Premier open-air weekend market featuring certified organic growers from Potohar and Margalla foothills.',
        farmer_count: 14
    },
    {
        id: 'mkt-lhr-model-town',
        name: 'Lahore Model Town Sunday Farmers Market',
        address: 'Central Park Ground, Model Town, Lahore',
        city: 'Lahore',
        operating_days: 'Sunday',
        opening_time: '07:30',
        closing_time: '16:00',
        latitude: 31.4826,
        longitude: 74.3218,
        map_provider: 'OpenStreetMap',
        image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
        description: 'Vibrant family market in Model Town offering farm-direct dairy, citrus, winter greens, and artisan bakes.',
        farmer_count: 22
    },
    {
        id: 'mkt-khi-clifton',
        name: 'Karachi Clifton Green Farmers Market',
        address: 'Near Beach Park, Block 2, Clifton, Karachi',
        city: 'Karachi',
        operating_days: 'Saturday',
        opening_time: '08:00',
        closing_time: '15:00',
        latitude: 24.8138,
        longitude: 67.0305,
        map_provider: 'OpenStreetMap',
        image_url: 'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=800&q=80',
        description: 'Seaside farmers market bringing Sindh river-belt produce, Malir farm vegetables, and pure honey to city residents.',
        farmer_count: 18
    },
    {
        id: 'mkt-rwp-hub',
        name: 'Rawalpindi Farm Fresh Hub',
        address: 'Ayub National Park Gate 2, Jhelum Road, Rawalpindi',
        city: 'Rawalpindi',
        operating_days: 'Tuesday, Thursday',
        opening_time: '08:30',
        closing_time: '17:30',
        latitude: 33.5684,
        longitude: 73.0886,
        map_provider: 'OpenStreetMap',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        description: 'Mid-week produce hub connecting Chakwal and Rawat organic growers with urban twin-city households.',
        farmer_count: 11
    },
    {
        id: 'mkt-psh-heritage',
        name: 'Peshawar Heritage Agri Market',
        address: 'Near Shahi Bagh, Khyber Bazaar Road, Peshawar',
        city: 'Peshawar',
        operating_days: 'Wednesday, Sunday',
        opening_time: '08:00',
        closing_time: '17:00',
        latitude: 34.0150,
        longitude: 71.5805,
        map_provider: 'OpenStreetMap',
        image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
        description: 'Traditional market famous for Swat valley fruits, Charsadda wild honey, and mountain walnuts.',
        farmer_count: 15
    }
];

const DEMO_FARMERS = [
    {
        id: 'fm-1',
        user_id: 'usr-farmer-1',
        stall_name: 'GreenValley Organic Farm',
        farmer_name: 'Tariq Mehmood',
        contact_person: 'Tariq Mehmood',
        phone: '+92 300 5112233',
        email: 'farmer@marketlink.com', // Demo Farmer Login!
        address: 'Chak Shahzad Agricultural Enclave, Islamabad',
        market_id: 'mkt-isb-f6',
        operating_days: 'Friday, Saturday',
        pickup_start: '08:30',
        pickup_end: '17:30',
        latitude: 33.6844,
        longitude: 73.1360,
        rating: 4.9,
        reviews_count: 38,
        status: 'approved',
        bio: 'Chemical-free farming for over 15 years in Islamabad outskirts. We harvest leafy greens at dawn on market day.',
        image_url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
        stall_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'fm-2',
        user_id: 'usr-farmer-2',
        stall_name: 'Potohar Fresh Orchards',
        farmer_name: 'Ayesha Khan',
        contact_person: 'Ayesha Khan',
        phone: '+92 333 4521890',
        email: 'potohar.fresh@marketlink.com',
        address: 'Talagang Road, Chakwal, Punjab',
        market_id: 'mkt-isb-f6',
        operating_days: 'Friday, Saturday',
        pickup_start: '09:00',
        pickup_end: '17:00',
        latitude: 33.7297,
        longitude: 73.0746,
        rating: 4.8,
        reviews_count: 27,
        status: 'approved',
        bio: 'Family-run olive and citrus orchard specializing in seasonal fruits and cold-pressed pure cooking oils.',
        image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
        stall_image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'fm-3',
        user_id: 'usr-farmer-3',
        stall_name: 'Sindh Dairy & Honey Farm',
        farmer_name: 'Rasheed Ahmed',
        contact_person: 'Rasheed Ahmed',
        phone: '+92 321 9876543',
        email: 'sindhdairy@marketlink.com',
        address: 'Malir River Basin Farms, Karachi',
        market_id: 'mkt-khi-clifton',
        operating_days: 'Saturday',
        pickup_start: '08:00',
        pickup_end: '14:30',
        latitude: 24.8138,
        longitude: 67.0305,
        rating: 4.9,
        reviews_count: 45,
        status: 'approved',
        bio: 'Grass-fed dairy buffaloes and wild mangrove forest bee hives. Providing 100% pure raw honey and organic butter.',
        image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
        stall_image: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'fm-4',
        user_id: 'usr-farmer-4',
        stall_name: 'Margalla Heritage Apiary',
        farmer_name: 'Bilal Qureshi',
        contact_person: 'Bilal Qureshi',
        phone: '+92 301 2345678',
        email: 'margalla.apiary@marketlink.com',
        address: 'Bari Imam Valley, Margalla Hills, Islamabad',
        market_id: 'mkt-rwp-hub',
        operating_days: 'Tuesday, Thursday',
        pickup_start: '09:00',
        pickup_end: '17:00',
        latitude: 33.5684,
        longitude: 73.0886,
        rating: 4.7,
        reviews_count: 22,
        status: 'approved',
        bio: 'Traditional beekeeping in the pristine acacia and berry forests of Margalla National Park.',
        image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        stall_image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'fm-5',
        user_id: 'usr-farmer-5',
        stall_name: 'Chenab Golden Grain & Bakery',
        farmer_name: 'Zainab Bibi',
        contact_person: 'Zainab Bibi',
        phone: '+92 345 8765432',
        email: 'chenab.bakery@marketlink.com',
        address: 'Bedian Road Farms, Lahore Cantt',
        market_id: 'mkt-lhr-model-town',
        operating_days: 'Sunday',
        pickup_start: '07:30',
        pickup_end: '15:30',
        latitude: 31.4826,
        longitude: 74.3218,
        rating: 4.8,
        reviews_count: 34,
        status: 'approved',
        bio: 'Stone-ground whole wheat flours, fresh artisan village breads, sourdough, and tea rusks baked with pure desi butter.',
        image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
        stall_image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'fm-6',
        user_id: 'usr-farmer-6',
        stall_name: 'Indus Valley Farm Produce',
        farmer_name: 'Kashif Javed',
        contact_person: 'Kashif Javed',
        phone: '+92 312 6543210',
        email: 'indusvalley@marketlink.com',
        address: 'Raiwind Agricultural Belt, Lahore',
        market_id: 'mkt-lhr-model-town',
        operating_days: 'Sunday',
        pickup_start: '08:00',
        pickup_end: '16:00',
        latitude: 31.4826,
        longitude: 74.3218,
        rating: 4.9,
        reviews_count: 41,
        status: 'approved',
        bio: 'Pesticide-free root vegetables, heirloom carrots, and farm-fresh desi eggs collected every morning.',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        stall_image: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'fm-7',
        user_id: 'usr-farmer-7',
        stall_name: 'Swat Mountain Fruit Co.',
        farmer_name: 'Nasir Ali',
        contact_person: 'Nasir Ali',
        phone: '+92 334 1122334',
        email: 'swatfruits@marketlink.com',
        address: 'Kalam Valley Orchards, Swat / Peshawar Outlet',
        market_id: 'mkt-psh-heritage',
        operating_days: 'Wednesday, Sunday',
        pickup_start: '08:30',
        pickup_end: '16:30',
        latitude: 34.0150,
        longitude: 71.5805,
        rating: 5.0,
        reviews_count: 52,
        status: 'approved',
        bio: 'High-altitude organic apples, sweet peaches, and dried mountain figs grown using glacial spring irrigation.',
        image_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
        stall_image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'fm-8',
        user_id: 'usr-farmer-8',
        stall_name: 'Hazara Fresh Greens',
        farmer_name: 'Fatima Noor',
        contact_person: 'Fatima Noor',
        phone: '+92 332 5566778',
        email: 'hazara.greens@marketlink.com',
        address: 'Haripur Valley Greenhouses, KPK',
        market_id: 'mkt-rwp-hub',
        operating_days: 'Tuesday, Thursday',
        pickup_start: '08:30',
        pickup_end: '17:00',
        latitude: 33.5684,
        longitude: 73.0886,
        rating: 4.8,
        reviews_count: 19,
        status: 'approved',
        bio: 'Hydroponic and open-field baby greens, crisp bell peppers, and fresh culinary herbs delivered fresh to twin cities.',
        image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        stall_image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
    }
];

const DEMO_PRODUCTS = [
    // --- Vegetables (8 Products) ---
    {
        id: 'prod-1',
        farmer_id: 'fm-1',
        category_id: 'cat-veg',
        name: 'Organic Desi Red Tomatoes',
        description: 'Vine-ripened, flavorful organic tomatoes grown without synthetic fertilizers. Juicy and rich in vitamins.',
        price: 180,
        unit: 'kg',
        stock_quantity: 45,
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-2',
        farmer_id: 'fm-6',
        category_id: 'cat-veg',
        name: 'Fresh Farm Potatoes (Desi Aloo)',
        description: 'New crop earth-dusted red potatoes from Raiwind. Perfect for curries, baking, and roasting.',
        price: 90,
        unit: 'kg',
        stock_quantity: 80,
        image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-3',
        farmer_id: 'fm-1',
        category_id: 'cat-veg',
        name: 'Fresh Crisp Spinach (Palak)',
        description: 'Locally grown broadleaf green spinach, harvested right before market day. Excellent source of iron.',
        price: 70,
        unit: 'bundle',
        stock_quantity: 35,
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-4',
        farmer_id: 'fm-6',
        category_id: 'cat-veg',
        name: 'Sweet Red Farm Carrots (Gajar)',
        description: 'Crunchy, naturally sweet winter carrots. Wonderful for fresh juices, salads, and traditional Gajar Halwa.',
        price: 110,
        unit: 'kg',
        stock_quantity: 50,
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-5',
        farmer_id: 'fm-8',
        category_id: 'cat-veg',
        name: 'Crisp Green Bell Peppers (Shimla Mirch)',
        description: 'Thick-walled crunchy capsicums grown in Haripur greenhouses. Vibrant flavor and aroma.',
        price: 190,
        unit: 'kg',
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-6',
        farmer_id: 'fm-8',
        category_id: 'cat-veg',
        name: 'Fresh Spearmint & Coriander Bundle',
        description: 'Fragrant garden pudina and fresh coriander leaves, essential for Pakistani chutneys and garnishes.',
        price: 60,
        unit: 'bundle',
        stock_quantity: 40,
        image_url: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-7',
        farmer_id: 'fm-1',
        category_id: 'cat-veg',
        name: 'Farm Fresh Desi Garlic (Lehsan)',
        description: 'Pungent, highly aromatic local garlic bulbs with natural medicinal oils intact.',
        price: 360,
        unit: 'kg',
        stock_quantity: 20,
        image_url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-8',
        farmer_id: 'fm-8',
        category_id: 'cat-veg',
        name: 'Crisp Salad Cucumbers (Kheera)',
        description: 'Tender seedless field cucumbers. Hydrating, crisp, and picked young for maximum sweetness.',
        price: 120,
        unit: 'kg',
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },

    // --- Fruits (6 Products) ---
    {
        id: 'prod-9',
        farmer_id: 'fm-2',
        category_id: 'cat-fruit',
        name: 'Premium Sindhri Farm Mangoes',
        description: 'The king of fruits from Sindh orchards. Exceptionally sweet, fragrant, and golden pulp.',
        price: 320,
        unit: 'kg',
        stock_quantity: 60,
        image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-10',
        farmer_id: 'fm-7',
        category_id: 'cat-fruit',
        name: 'Swat Valley Red Delicious Apples',
        description: 'Orchard-fresh crisp apples grown in high Swat elevations with natural mountain spring water.',
        price: 260,
        unit: 'kg',
        stock_quantity: 40,
        image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-11',
        farmer_id: 'fm-2',
        category_id: 'cat-fruit',
        name: 'Potohar Fresh Kinnow Oranges',
        description: 'Juicy, seedless citrus packed with natural vitamin C. Perfect for morning fresh juices.',
        price: 200,
        unit: 'dozen',
        stock_quantity: 55,
        image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-12',
        farmer_id: 'fm-7',
        category_id: 'cat-fruit',
        name: 'Swat Kalam Fresh Strawberries',
        description: 'Vibrant sweet-tart berries picked at peak ripeness. Zero chemical sprays or wax.',
        price: 450,
        unit: 'box',
        stock_quantity: 20,
        image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-13',
        farmer_id: 'fm-2',
        category_id: 'cat-fruit',
        name: 'Sweet Farm White Guavas (Amrood)',
        description: 'Fragrant, soft pink-and-white centered guavas from Chakwal groves.',
        price: 160,
        unit: 'kg',
        stock_quantity: 35,
        image_url: 'https://images.unsplash.com/photo-1536511135899-7f30eb732a31?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-14',
        farmer_id: 'fm-7',
        category_id: 'cat-fruit',
        name: 'Natural Dried Swat Mountain Figs (Injeer)',
        description: 'Sun-dried wild figs strung on natural jute cord. Rich in fiber, iron, and potassium.',
        price: 850,
        unit: 'pack',
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },

    // --- Dairy (5 Products) ---
    {
        id: 'prod-15',
        farmer_id: 'fm-3',
        category_id: 'cat-dairy',
        name: 'Pure Raw Buffalo Milk (Khaalis Doodh)',
        description: 'Whole, unadulterated grass-fed buffalo milk chilled immediately after milking. High butterfat content.',
        price: 220,
        unit: 'liter',
        stock_quantity: 50,
        image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-16',
        farmer_id: 'fm-3',
        category_id: 'cat-dairy',
        name: 'Traditional Desi Ghee (Khaalis Ghee)',
        description: 'Cultured butter clarified slowly over clay stoves in traditional earthen pots. Incomparable golden aroma.',
        price: 2400,
        unit: 'kg',
        stock_quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-17',
        farmer_id: 'fm-3',
        category_id: 'cat-dairy',
        name: 'Farm Fresh Soft Paneer (Cottage Cheese)',
        description: 'Freshly pressed mild farmer paneer made with full cream milk. High protein and ready for cooking.',
        price: 850,
        unit: 'kg',
        stock_quantity: 18,
        image_url: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-18',
        farmer_id: 'fm-3',
        category_id: 'cat-dairy',
        name: 'Desi Cultured Butter (Makhan)',
        description: 'Salt-free churned white butter from pasture-fed buffalo milk. Soft, fresh, and melts easily.',
        price: 650,
        unit: '500g',
        stock_quantity: 20,
        image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-19',
        farmer_id: 'fm-3',
        category_id: 'cat-dairy',
        name: 'Farm Clay-Pot Yogurt (Desi Dahi)',
        description: 'Thick, probiotic-rich set yogurt naturally fermented in porous red clay bowls.',
        price: 250,
        unit: 'kg',
        stock_quantity: 24,
        image_url: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },

    // --- Bakery (4 Products) ---
    {
        id: 'prod-20',
        farmer_id: 'fm-5',
        category_id: 'cat-bakery',
        name: 'Artisan Sourdough Country Loaf',
        description: 'Wild yeast fermented for 24 hours using stoneground whole wheat flour. Crisp crust and airy crumb.',
        price: 380,
        unit: 'loaf',
        stock_quantity: 22,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-21',
        farmer_id: 'fm-5',
        category_id: 'cat-bakery',
        name: 'Traditional Saffron Sheermal',
        description: 'Mildly sweet flatbread kneaded with milk and saffron butter, baked golden in clay ovens.',
        price: 150,
        unit: 'piece',
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-22',
        farmer_id: 'fm-5',
        category_id: 'cat-bakery',
        name: 'Stoneground Whole Wheat Flour (Chakki Atta)',
        description: 'Single-source wheat grown along the Chenab river basin, milled cold to protect grain nutrients.',
        price: 680,
        unit: '5kg bag',
        stock_quantity: 40,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-23',
        farmer_id: 'fm-5',
        category_id: 'cat-bakery',
        name: 'Desi Butter Tea Rusks (Cake Rusk)',
        description: 'Crisp twice-baked tea rusks loaded with cardamom and real dairy butter. Classic tea pairing.',
        price: 320,
        unit: 'pack',
        stock_quantity: 28,
        image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },

    // --- Eggs (2 Products) ---
    {
        id: 'prod-24',
        farmer_id: 'fm-6',
        category_id: 'cat-eggs',
        name: 'Pasture-Raised Free-Range Desi Eggs',
        description: 'Authentic desi brown eggs from hens that roam outdoors on grassy pastures. Rich orange yolks.',
        price: 390,
        unit: 'dozen',
        stock_quantity: 35,
        image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-25',
        farmer_id: 'fm-1',
        category_id: 'cat-eggs',
        name: 'Farm Fresh Organic White Eggs',
        description: 'Farm eggs collected daily with non-GMO grain feed. Carefully inspected and packed.',
        price: 310,
        unit: 'dozen',
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },

    // --- Honey (3 Products) ---
    {
        id: 'prod-26',
        farmer_id: 'fm-4',
        category_id: 'cat-honey',
        name: 'Raw Margalla Wildflower Berry Honey',
        description: 'Unprocessed, cold-filtered natural forest honey from native berries. Rich in antioxidants.',
        price: 1450,
        unit: '500g jar',
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-27',
        farmer_id: 'fm-4',
        category_id: 'cat-honey',
        name: 'Pure Sidr / Beri Mountain Honey',
        description: 'Prestigious monofloral honey harvested during autumn Sidr bloom. World-renowned taste and medicinal quality.',
        price: 2800,
        unit: '500g jar',
        stock_quantity: 12,
        image_url: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: true
    },
    {
        id: 'prod-28',
        farmer_id: 'fm-3',
        category_id: 'cat-honey',
        name: 'Sindh Mangrove Forest Acacia Honey',
        description: 'Light golden, gentle sweet floral honey collected from coastal mangrove reserves.',
        price: 1350,
        unit: '500g jar',
        stock_quantity: 16,
        image_url: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },

    // --- Other (2 Products) ---
    {
        id: 'prod-29',
        farmer_id: 'fm-2',
        category_id: 'cat-other',
        name: 'Cold-Pressed Pure Mustard Oil (Sarson ka Tel)',
        description: 'First press virgin yellow mustard seed oil. Traditional aroma, perfect for cooking, pickling, and massage.',
        price: 750,
        unit: 'liter',
        stock_quantity: 28,
        image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    },
    {
        id: 'prod-30',
        farmer_id: 'fm-8',
        category_id: 'cat-other',
        name: 'Organic Chamomile & Lemongrass Herbal Infusion',
        description: 'Hand-picked botanical tea herbs dried in shade. Caffeine-free evening relaxation tea.',
        price: 480,
        unit: 'pack',
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
        status: 'available',
        is_popular: false
    }
];

const DEMO_CUSTOMERS = [
    {
        id: 'usr-customer-1',
        name: 'Hamza Farooq',
        email: 'customer@marketlink.com', // Demo Customer Login!
        phone: '+92 300 1234567',
        address: 'House 42, Street 15, Sector F-7/2, Islamabad',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-2',
        name: 'Maryam Saddiqui',
        email: 'maryam.s@gmail.com',
        phone: '+92 321 4567890',
        address: 'Apartment 4B, Clifton Block 5, Karachi',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-3',
        name: 'Bilal Hassan',
        email: 'bilal.hassan@yahoo.com',
        phone: '+92 333 7890123',
        address: 'House 112, Phase 3, DHA, Lahore',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-4',
        name: 'Sara Danish',
        email: 'sara.danish@gmail.com',
        phone: '+92 345 3219876',
        address: 'Street 9, Sector G-11/3, Islamabad',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-5',
        name: 'Zeeshan Akhtar',
        email: 'zeeshan.akhtar@gmail.com',
        phone: '+92 312 8765432',
        address: 'Block C, Model Town, Lahore',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-6',
        name: 'Amina Tariq',
        email: 'amina.tariq@gmail.com',
        phone: '+92 332 9988776',
        address: 'House 85, Westridge 1, Rawalpindi',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-7',
        name: 'Usman Malik',
        email: 'usman.malik@outlook.com',
        phone: '+92 301 5432167',
        address: 'Hayatabad Phase 4, Peshawar',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-8',
        name: 'Sana Rehman',
        email: 'sana.rehman@gmail.com',
        phone: '+92 323 1122445',
        address: 'Sector E-11/2, Islamabad',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-9',
        name: 'Fahad Mehmood',
        email: 'fahad.m@gmail.com',
        phone: '+92 335 7788990',
        address: 'Defence View Phase 2, Karachi',
        role: 'customer',
        status: 'active'
    },
    {
        id: 'usr-customer-10',
        name: 'Hina Qasim',
        email: 'hina.qasim@gmail.com',
        phone: '+92 314 3344556',
        address: 'Gulberg 3, Lahore',
        role: 'customer',
        status: 'active'
    }
];

const DEMO_ADMIN = {
    id: 'usr-admin-1',
    name: 'Administrator',
    email: 'admin@marketlink.com', // Demo Admin Login!
    phone: '+92 51 9201122',
    address: 'MarketLink Central Directorate, Blue Area, Islamabad',
    role: 'admin',
    status: 'active'
};

const DEMO_ORDERS = [
    {
        id: 'ord-101',
        order_number: 'ML-2026-801',
        customer_id: 'usr-customer-1',
        customer_name: 'Hamza Farooq',
        farmer_id: 'fm-1',
        farmer_name: 'GreenValley Organic Farm',
        market_id: 'mkt-isb-f6',
        market_name: 'Islamabad F-6 Super Market Organic Bazaar',
        pickup_date: '2026-09-26',
        pickup_time: '10:00 AM - 11:30 AM',
        total_amount: 1110,
        status: 'Placed',
        notes: 'Please pack in eco-friendly brown bags if possible.',
        created_at: '2026-09-24T14:20:00Z',
        items: [
            { product_id: 'prod-1', product_name: 'Organic Desi Red Tomatoes', quantity: 2, price: 180, subtotal: 360 },
            { product_id: 'prod-3', product_name: 'Fresh Crisp Spinach (Palak)', quantity: 2, price: 70, subtotal: 140 },
            { product_id: 'prod-25', product_name: 'Farm Fresh Organic White Eggs', quantity: 2, price: 310, subtotal: 620 }
        ]
    },
    {
        id: 'ord-102',
        order_number: 'ML-2026-802',
        customer_id: 'usr-customer-1',
        customer_name: 'Hamza Farooq',
        farmer_id: 'fm-4',
        farmer_name: 'Margalla Heritage Apiary',
        market_id: 'mkt-rwp-hub',
        market_name: 'Rawalpindi Farm Fresh Hub',
        pickup_date: '2026-09-25',
        pickup_time: '02:00 PM - 03:30 PM',
        total_amount: 2800,
        status: 'Accepted',
        notes: 'Will bring cash at pickup.',
        created_at: '2026-09-23T11:00:00Z',
        items: [
            { product_id: 'prod-27', product_name: 'Pure Sidr / Beri Mountain Honey', quantity: 1, price: 2800, subtotal: 2800 }
        ]
    },
    {
        id: 'ord-103',
        order_number: 'ML-2026-803',
        customer_id: 'usr-customer-1',
        customer_name: 'Hamza Farooq',
        farmer_id: 'fm-1',
        farmer_name: 'GreenValley Organic Farm',
        market_id: 'mkt-isb-f6',
        market_name: 'Islamabad F-6 Super Market Organic Bazaar',
        pickup_date: '2026-09-19',
        pickup_time: '11:00 AM - 12:30 PM',
        total_amount: 900,
        status: 'Completed',
        notes: 'Order fulfilled on time.',
        created_at: '2026-09-18T09:30:00Z',
        items: [
            { product_id: 'prod-1', product_name: 'Organic Desi Red Tomatoes', quantity: 3, price: 180, subtotal: 540 },
            { product_id: 'prod-7', product_name: 'Farm Fresh Desi Garlic (Lehsan)', quantity: 1, price: 360, subtotal: 360 }
        ]
    },
    {
        id: 'ord-104',
        order_number: 'ML-2026-804',
        customer_id: 'usr-customer-3',
        customer_name: 'Bilal Hassan',
        farmer_id: 'fm-5',
        farmer_name: 'Chenab Golden Grain & Bakery',
        market_id: 'mkt-lhr-model-town',
        market_name: 'Lahore Model Town Sunday Farmers Market',
        pickup_date: '2026-09-27',
        pickup_time: '09:00 AM - 10:30 AM',
        total_amount: 850,
        status: 'Ready for Pickup',
        notes: 'Sourdough requested freshly sliced.',
        created_at: '2026-09-24T16:45:00Z',
        items: [
            { product_id: 'prod-20', product_name: 'Artisan Sourdough Country Loaf', quantity: 1, price: 380, subtotal: 380 },
            { product_id: 'prod-21', product_name: 'Traditional Saffron Sheermal', quantity: 1, price: 150, subtotal: 150 },
            { product_id: 'prod-23', product_name: 'Desi Butter Tea Rusks (Cake Rusk)', quantity: 1, price: 320, subtotal: 320 }
        ]
    }
];

const DEMO_REVIEWS = [
    {
        id: 'rev-1',
        customer_id: 'usr-customer-1',
        customer_name: 'Hamza Farooq',
        farmer_id: 'fm-1',
        product_id: 'prod-1',
        rating: 5,
        comment: 'Tariq sahib always has the best tomatoes in Islamabad. Beautiful aroma and taste just like our village produce!',
        created_at: '2026-09-20'
    },
    {
        id: 'rev-2',
        customer_id: 'usr-customer-3',
        customer_name: 'Bilal Hassan',
        farmer_id: 'fm-5',
        product_id: 'prod-20',
        rating: 5,
        comment: 'The sourdough country loaf is exceptional. You cannot find bread of this artisan quality in regular bakeries.',
        created_at: '2026-09-18'
    },
    {
        id: 'rev-3',
        customer_id: 'usr-customer-2',
        customer_name: 'Maryam Saddiqui',
        farmer_id: 'fm-3',
        product_id: 'prod-16',
        rating: 5,
        comment: 'The desi ghee is 100% genuine and the fragrance fills the kitchen when cooking. Pre-order pickup was so smooth.',
        created_at: '2026-09-15'
    },
    {
        id: 'rev-4',
        customer_id: 'usr-customer-4',
        customer_name: 'Sara Danish',
        farmer_id: 'fm-7',
        product_id: 'prod-10',
        rating: 5,
        comment: 'Sweetest mountain apples I have tasted this year. So fresh and crisp.',
        created_at: '2026-09-12'
    }
];

const DEMO_PICKUP_SLOTS = [
    { id: 'slot-1', farmer_id: 'fm-1', day: 'Friday', time: '09:00 AM - 10:30 AM', max_orders: 12, cutoff: '4 hours before' },
    { id: 'slot-2', farmer_id: 'fm-1', day: 'Friday', time: '11:00 AM - 12:30 PM', max_orders: 15, cutoff: '4 hours before' },
    { id: 'slot-3', farmer_id: 'fm-1', day: 'Saturday', time: '10:00 AM - 11:30 AM', max_orders: 15, cutoff: '4 hours before' },
    { id: 'slot-4', farmer_id: 'fm-1', day: 'Saturday', time: '02:00 PM - 03:30 PM', max_orders: 10, cutoff: '4 hours before' },
    { id: 'slot-5', farmer_id: 'fm-2', day: 'Friday', time: '09:30 AM - 11:00 AM', max_orders: 10, cutoff: '6 hours before' },
    { id: 'slot-6', farmer_id: 'fm-3', day: 'Saturday', time: '08:30 AM - 10:00 AM', max_orders: 20, cutoff: '4 hours before' },
    { id: 'slot-7', farmer_id: 'fm-5', day: 'Sunday', time: '08:00 AM - 09:30 AM', max_orders: 15, cutoff: '3 hours before' },
    { id: 'slot-8', farmer_id: 'fm-5', day: 'Sunday', time: '10:00 AM - 11:30 AM', max_orders: 15, cutoff: '3 hours before' }
];
