# Auto More

---
A [Flarum](https://flarum.org) extension. Automatically clicks the 'load more' button when it comes into view.

A revitalisation of the much-loved **Auto-more** extension originally by NorioDS, updated for Flarum 2.0.

## Disclaimer

This software is provided **"AS IS"**, without any warranty. While it has been tested and reasonable efforts are made to ensure security and reliability, no guarantees are provided. As an open project, anyone may contribute or report issues, but this does not imply endorsement or liability from the maintainers.

**You use this software entirely at your own risk.** The authors and contributors are not liable for any damages, data loss, or unexpected behavior resulting from its use, modification, or distribution. Always review and test the code independently before deploying it in critical or production environments.

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
