(function () {
	/**
	 * Injects minimal CSS so that team cards remain visible even when
	 * third-party sliders/isotope scripts fail to initialise.
	 */
	const style = document.createElement('style');
	style.id = 'knp-team-fallback-style';
	style.textContent = `
.knp-team-fallback-carousel {
	display: grid !important;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 30px;
	opacity: 1 !important;
	visibility: visible !important;
}
.knp-team-fallback-carousel .team-container {
	opacity: 1 !important;
	visibility: visible !important;
}
.knp-team-fallback-carousel .team-media {
	margin-bottom: 16px;
}
.knp-team-fallback-grid {
	display: grid !important;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 40px 24px;
	opacity: 1 !important;
	visibility: visible !important;
}
.knp-team-fallback-grid .wf-cell {
	width: auto !important;
	height: 100%;
	opacity: 1 !important;
	visibility: visible !important;
	position: static !important;
	display: block !important;
}
.knp-team-fallback-grid .team-container {
	width: auto !important;
	height: 100%;
	opacity: 1 !important;
	visibility: visible !important;
	position: static !important;
	display: flex;
	flex-direction: column;
}
.knp-team-fallback-grid .team-media {
	margin-bottom: 16px;
}
.knp-team-fallback-hidden {
	display: none !important;
}
`;
	if (!document.head.querySelector('#knp-team-fallback-style')) {
		document.head.appendChild(style);
	}

	const ready = (fn) => {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn, { once: true });
		} else {
			fn();
		}
	};

	const hasOwlLoaded = (carousel) =>
		carousel.classList.contains('owl-loaded') || carousel.querySelector('.owl-stage');

	const enhanceCarousel = (carousel) => {
		if (!carousel || hasOwlLoaded(carousel)) {
			return;
		}

		const items = carousel.querySelectorAll('.team-container');
		if (!items.length) {
			return;
		}

		carousel.classList.add('knp-team-fallback-carousel');
		carousel.style.removeProperty('display');
		carousel.style.removeProperty('opacity');
		carousel.style.removeProperty('visibility');
		carousel.dataset.knpFallback = 'carousel';
	};

	const enhanceMasonry = (wrapper) => {
		if (!wrapper) {
			return;
		}

		const grid = wrapper.querySelector('.dt-css-grid');
		if (!grid) {
			return;
		}

		// The7 adds inline width/height once isotope initialises. Bail out if already active.
		if (wrapper.classList.contains('isotope-inited') || grid.dataset.knpFallbackApplied === '1') {
			return;
		}

		const items = grid.querySelectorAll('.team-container');
		if (!items.length) {
			return;
		}

	grid.classList.add('knp-team-fallback-grid');
	grid.style.removeProperty('height');
	grid.style.removeProperty('position');
	grid.style.removeProperty('opacity');
	grid.style.removeProperty('visibility');
	grid.dataset.knpFallbackApplied = '1';

	wrapper.classList.remove('loading-effect-fade-in');
	wrapper.classList.add('knp-team-fallback-grid-wrapper');
	wrapper.style.removeProperty('height');
	wrapper.style.removeProperty('opacity');
	wrapper.style.removeProperty('visibility');

		const paginator = wrapper.querySelector('.paginator');
		if (paginator) {
			paginator.classList.add('knp-team-fallback-hidden');
		}
	};

	const applyFallbacks = () => {
		document
			.querySelectorAll('.team-carousel-shortcode.dt-owl-carousel-call')
			.forEach((carousel) => {
				if (carousel.dataset.knpFallback !== 'carousel') {
					enhanceCarousel(carousel);
				}
			});

		document.querySelectorAll('.dt-team-masonry-shortcode').forEach((wrapper) => {
			enhanceMasonry(wrapper);
		});
	};

	ready(() => {
		// Give the original scripts a chance to run. If nothing happens within 1s, fall back.
		setTimeout(applyFallbacks, 1100);
		// Re-check after additional delay in case of lazy network scripts.
		setTimeout(applyFallbacks, 2500);
	});
})();
