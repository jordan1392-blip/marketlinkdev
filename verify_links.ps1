$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse
$broken = @()

foreach ($f in $htmlFiles) {
    $content = Get-Content $f.FullName -Raw
    $dir = $f.DirectoryName
    
    # Check script tags
    $matches = [regex]::Matches($content, '<script[^>]+src=["'']([^"'']+)["'']')
    foreach ($m in $matches) {
        $src = $m.Groups[1].Value
        if (-not ($src.StartsWith('http') -or $src.StartsWith('//'))) {
            $srcClean = $src.Split('?')[0].Replace('/', '\')
            $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $srcClean))
            if (-not (Test-Path $target)) {
                $broken += "Broken script in $($f.FullName): $src -> $target"
            }
        }
    }

    # Check link css tags
    $cssMatches = [regex]::Matches($content, '<link[^>]+href=["'']([^"'']+)["'']')
    foreach ($m in $cssMatches) {
        $href = $m.Groups[1].Value
        if (-not ($href.StartsWith('http') -or $href.StartsWith('//'))) {
            $hrefClean = $href.Split('?')[0].Replace('/', '\')
            $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $hrefClean))
            if (-not (Test-Path $target)) {
                $broken += "Broken link in $($f.FullName): $href -> $target"
            }
        }
    }

    # Check internal anchor links
    $aMatches = [regex]::Matches($content, '<a[^>]+href=["'']([^"'']+\.html[^"'']*)["'']')
    foreach ($m in $aMatches) {
        $href = $m.Groups[1].Value
        if (-not ($href.StartsWith('http') -or $href.StartsWith('//') -or $href.StartsWith('#') -or $href.StartsWith('javascript:'))) {
            $pathOnly = $href.Split('?')[0].Split('#')[0].Replace('/', '\')
            if ($pathOnly) {
                $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $pathOnly))
                if (-not (Test-Path $target)) {
                    $broken += "Broken anchor href in $($f.FullName): $href -> $target"
                }
            }
        }
    }
}

if ($broken.Count -eq 0) {
    Write-Host "SUCCESS: All script, CSS, and internal HTML link references are 100% valid!" -ForegroundColor Green
} else {
    Write-Host "FAILED: Found $($broken.Count) broken paths:" -ForegroundColor Red
    $broken | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
}
