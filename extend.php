<?php

/*
 * This file is part of peopleinside/automore.
 *
 * Copyright (c) 2024 PeopleInside.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace PeopleInside\AutoMore;

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js'),

    new Extend\Locales(__DIR__ . '/locale'),

    // Registra la preferenza utente (default: true = attivo)
    (new Extend\User())
        ->registerPreference('automore_enabled', function ($value) {
            return (bool) $value;
        }, true),
];
