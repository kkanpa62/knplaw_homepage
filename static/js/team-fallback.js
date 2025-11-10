(function () {
	var STYLE_ID = 'knp-team-fallback-style';
	var FALLBACK_GRID = 'knp-team-fallback-grid';
	var FALLBACK_GRID_WRAPPER = 'knp-team-fallback-grid-wrapper';
	var FALLBACK_CAROUSEL = 'knp-team-fallback-carousel';
	var HIDDEN_CLASS = 'knp-team-fallback-hidden';

	function ready(fn) {
		if (document.readyState === 'loading') {
			var handler = function () {
				document.removeEventListener('DOMContentLoaded', handler);
				fn();
			};
			document.addEventListener('DOMContentLoaded', handler);
		} else {
			fn();
		}
	}

	function addClass(el, className) {
		if (!el) {
			return;
		}
		if (el.classList) {
			el.classList.add(className);
		} else if (!hasClass(el, className)) {
			el.className = el.className ? el.className + ' ' + className : className;
		}
	}

	function removeClass(el, className) {
		if (!el) {
			return;
		}
		if (el.classList) {
			el.classList.remove(className);
		} else if (hasClass(el, className)) {
			var classes = el.className ? el.className.split(/\s+/) : [];
			for (var i = classes.length - 1; i >= 0; i--) {
				if (classes[i] === className) {
					classes.splice(i, 1);
				}
			}
			el.className = classes.join(' ');
		}
	}

	function hasClass(el, className) {
		if (!el || !className) {
			return false;
		}
		if (el.classList) {
			return el.classList.contains(className);
		}
		var classes = el.className ? el.className.split(/\s+/) : [];
		for (var i = 0; i < classes.length; i++) {
			if (classes[i] === className) {
				return true;
			}
		}
		return false;
	}

	function injectStyle() {
		if (document.getElementById(STYLE_ID)) {
			return;
		}
		var style = document.createElement('style');
		style.id = STYLE_ID;
		style.textContent =
			'.' + FALLBACK_CAROUSEL + '{display:grid !important;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:30px;opacity:1 !important;visibility:visible !important;}' +
			'.' + FALLBACK_CAROUSEL + ' .team-container{opacity:1 !important;visibility:visible !important;}' +
			'.' + FALLBACK_CAROUSEL + ' .team-media{margin-bottom:16px;}' +
			'.' + FALLBACK_GRID + '{display:grid !important;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:40px 24px;opacity:1 !important;visibility:visible !important;}' +
			'.' + FALLBACK_GRID + ' .wf-cell{width:auto !important;height:100%;opacity:1 !important;visibility:visible !important;position:static !important;display:block !important;}' +
			'.' + FALLBACK_GRID + ' .team-container{width:auto !important;height:100%;opacity:1 !important;visibility:visible !important;position:static !important;display:flex;flex-direction:column;}' +
			'.' + FALLBACK_GRID + ' .team-media{margin-bottom:16px;}' +
			'.' + HIDDEN_CLASS + '{display:none !important;}';
		document.head.appendChild(style);
	}

	function hasOwlLoaded(carousel) {
		return (
			hasClass(carousel, 'owl-loaded') ||
			(carousel.querySelector && carousel.querySelector('.owl-stage'))
		);
	}

	function enhanceCarousel(carousel) {
		if (!carousel || hasOwlLoaded(carousel) || carousel.dataset.knpFallback === 'carousel') {
			return;
		}
		var items = carousel.querySelectorAll('.team-container');
		if (!items.length) {
			return;
		}
		addClass(carousel, FALLBACK_CAROUSEL);
		carousel.style.removeProperty('display');
		carousel.style.removeProperty('opacity');
		carousel.style.removeProperty('visibility');
		carousel.dataset.knpFallback = 'carousel';
	}

	function enhanceMasonry(wrapper) {
		if (!wrapper) {
			return;
		}
		var grid = wrapper.querySelector('.dt-css-grid');
		if (!grid) {
			return;
		}
		if (hasClass(wrapper, 'isotope-inited') || grid.dataset.knpFallbackApplied === '1') {
			return;
		}
		var items = grid.querySelectorAll('.team-container');
		if (!items.length) {
			return;
		}
		addClass(grid, FALLBACK_GRID);
		grid.style.removeProperty('height');
		grid.style.removeProperty('position');
		grid.style.removeProperty('opacity');
		grid.style.removeProperty('visibility');
		grid.dataset.knpFallbackApplied = '1';

		removeClass(wrapper, 'loading-effect-fade-in');
		addClass(wrapper, FALLBACK_GRID_WRAPPER);
		wrapper.style.removeProperty('height');
		wrapper.style.removeProperty('opacity');
		wrapper.style.removeProperty('visibility');

		var paginator = wrapper.querySelector('.paginator');
		if (paginator) {
			addClass(paginator, HIDDEN_CLASS);
		}
	}

	function applyFallbacks() {
		var carousels = document.querySelectorAll('.team-carousel-shortcode.dt-owl-carousel-call');
		for (var i = 0; i < carousels.length; i++) {
			enhanceCarousel(carousels[i]);
		}
		var grids = document.querySelectorAll('.dt-team-masonry-shortcode');
		for (var j = 0; j < grids.length; j++) {
			enhanceMasonry(grids[j]);
		}
	}

	ready(function () {
		injectStyle();
		setTimeout(applyFallbacks, 1100);
		setTimeout(applyFallbacks, 2500);
	});
})();
