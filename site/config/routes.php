<?php
return [
    [
        'pattern' => 'filter/(:any)',
        'action'  => function ($filter) {
            // Load the default template
            $content = tpl::load(kirby()->root('templates') . '/default.php', [
                'filter' => $filter // Pass the filter parameter to the template if needed
            ]);

            // Return a proper response with status code 200
            return new Kirby\Cms\Response($content, 'html', 200);
        }
    ]
];