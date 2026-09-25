$port = 3000
$pages = @(
    'index.html',
    'markets.html',
    'farmers.html',
    'farmer-profile.html',
    'products.html',
    'product-details.html',
    'cart.html',
    'checkout.html',
    'login.html',
    'register.html',
    'about.html',
    'contact.html',
    'customer/dashboard.html',
    'customer/orders.html',
    'customer/favorites.html',
    'customer/profile.html',
    'farmer/dashboard.html',
    'farmer/products.html',
    'farmer/orders.html',
    'farmer/pickup-slots.html',
    'farmer/profile.html',
    'admin/dashboard.html',
    'admin/users.html',
    'admin/farmers.html',
    'admin/markets.html',
    'admin/products.html',
    'admin/reviews.html',
    'admin/reports.html',
    'css/style.css',
    'js/config.js',
    'js/demo-data.js',
    'js/db.js',
    'js/supabase.js',
    'js/auth.js',
    'js/app.js',
    'js/cart.js',
    'js/checkout.js',
    'js/chatbot.js',
    'js/markets.js',
    'js/products.js',
    'js/farmer.js',
    'js/admin.js',
    'database/mysql-schema.sql',
    'database/mongodb-seed.json',
    'api/health',
    'api/markets',
    'api/products',
    'api/categories',
    'api/farmers',
    'api/stats'
)

$passed = 0
$failed = 0

foreach ($p in $pages) {
    $url = "http://localhost:$port/$p"
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
        if ($res.StatusCode -eq 200) {
            Write-Host "[OK 200] $p" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "[FAIL $($res.StatusCode)] $p" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "[ERROR] $p : $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nTotal Verified: $passed Passed, $failed Failed." -ForegroundColor Cyan
