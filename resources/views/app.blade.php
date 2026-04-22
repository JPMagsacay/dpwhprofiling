<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>DPWH Service Profiling</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        
        @php
            $distPath = public_path('dist');
            $indexPath = $distPath . '/index.html';
            
            if (file_exists($indexPath)) {
                $html = file_get_contents($indexPath);
                
                // Extract CSS links
                preg_match_all('/<link[^>]+rel="stylesheet"[^>]*>/', $html, $styles);
                foreach ($styles[0] as $style) {
                    echo $style;
                }
            }
        @endphp
    </head>
    <body>
        <div id="root"></div>
        
        @php
            if (file_exists($indexPath)) {
                // Extract script tags
                preg_match_all('/<script[^>]*>.*?<\/script>/s', $html, $scripts);
                foreach ($scripts[0] as $script) {
                    echo $script;
                }
            }
        @endphp
    </body>
</html>
