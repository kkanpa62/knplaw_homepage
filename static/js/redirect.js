(function () {
	// Normalise runtime redirects so each static landing page can share the same logic.
	'use strict';

	const DEFAULTS = {
		productionOrigin: 'http://knp-law.co.kr',
		path: '',
		allowHosts: ['knp-law.co.kr', 'www.knp-law.co.kr'],
		localHosts: ['', 'localhost', '127.0.0.1', '[::1]'],
		ensureTrailingSlash: true,
		updateMetaSelectors: ['[data-redirect-meta]'],
		updateCanonicalSelectors: ['[data-redirect-canonical]'],
		updateLinkSelectors: ['[data-redirect-link]']
	};

	const config = Object.assign({}, DEFAULTS, window.KNPLAW_REDIRECT || {});
	delete window.KNPLAW_REDIRECT;

	try {
		const host = window.location.hostname || '';
		const hostLower = host.toLowerCase();

		if (config.localHosts.map((h) => h.toLowerCase()).includes(hostLower)) {
			return;
		}

		if (config.allowHosts.map((h) => h.toLowerCase()).includes(hostLower)) {
			return;
		}

		const origin = String(config.productionOrigin || DEFAULTS.productionOrigin).replace(/\/+$/, '');
		let path = typeof config.path === 'string' ? config.path : window.location.pathname;
		path = path.replace(/^\/*/, '');

		let target = origin;
		if (path) {
			target += `/${path}`;
		}

		if (config.ensureTrailingSlash && !target.endsWith('/')) {
			target += '/';
		}

		const current = window.location.href.replace(/\/+$/, '');
		const normalizedTarget = target.replace(/\/+$/, '');

		const updateAttribute = (selectors, attribute, value) => {
			selectors
				.flatMap((selector) => Array.from(document.querySelectorAll(selector)))
				.forEach((node) => {
					node.setAttribute(attribute, value);
				});
		};

		updateAttribute(config.updateMetaSelectors, 'content', `0; url=${target}`);
		updateAttribute(config.updateCanonicalSelectors, 'href', target);
		updateAttribute(config.updateLinkSelectors, 'href', target);

		if (current !== normalizedTarget) {
			window.location.replace(target);
		}
	} catch (error) {
		console.error('[knplaw redirect] failed:', error);
	}
})();
