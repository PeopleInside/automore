<?php

namespace PeopleInside\AutoMore;

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js'),

    new Extend\Locales(__DIR__.'/locale'),

    // Registra la preferenza utente (default: true = attivo)
    (new Extend\User())
        ->registerPreference('automore_enabled', function ($value) {
            return (bool) $value;
        }, true),
];
