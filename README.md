# Auto More

---
A [Flarum](https://flarum.org) extension. Automatically clicks the 'load more' button when it comes into view.

A revitalisation of the much-loved **Auto-more** extension originally by NorioDS, updated for Flarum 2.0.

### Installation

Install manually with composer:

```sh
composer require peopleinside/automore
```

### Updating

```sh
composer update peopleinside/automore
php flarum cache:clear
```

### Links

- [GitHub Repository](https://github.com/PeopleInside/automore)
- [Flarum Discuss](https://discuss.flarum.org)

### Credits
- **PeopleInside** for the Flarum 2.0 update and modernization (jQuery removal, performance optimization with IntersectionObserver, safety throttle limits).
- [Katos](https://github.com/Katosdev) picking up development once the extension was abandoned, refactoring and maintaining it for Flarum 1.x.
- [Ralkage](https://github.com/Ralkage) for making it beta-8 compatible and doing some nice cleanup.
- [NorioDS](https://github.com/noriods) for the initial release and concept of Automore.
