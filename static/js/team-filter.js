(function () {
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

	function toArray(list) {
		return list ? Array.prototype.slice.call(list) : [];
	}

	function hasClass(element, className) {
		if (!className) {
			return true;
		}
		if (element.classList) {
			return element.classList.contains(className);
		}
		var classes = element.className ? element.className.split(/\s+/) : [];
		for (var i = 0; i < classes.length; i++) {
			if (classes[i] === className) {
				return true;
			}
		}
		return false;
	}

	function addClass(element, className) {
		if (!className || !element) {
			return;
		}
		if (element.classList) {
			element.classList.add(className);
		} else if (!hasClass(element, className)) {
			element.className = element.className ? element.className + ' ' + className : className;
		}
	}

	function removeClass(element, className) {
		if (!className || !element) {
			return;
		}
		if (element.classList) {
			element.classList.remove(className);
		} else if (hasClass(element, className)) {
			var classes = element.className ? element.className.split(/\s+/) : [];
			for (var i = classes.length - 1; i >= 0; i--) {
				if (classes[i] === className) {
					classes.splice(i, 1);
				}
			}
			element.className = classes.join(' ');
		}
	}

	function toggleHidden(element, shouldHide) {
		if (!element) {
			return;
		}

		if (shouldHide) {
			addClass(element, HIDDEN_CLASS);
			if (element.style && element.style.setProperty) {
				element.style.setProperty('display', 'none', 'important');
			} else {
				element.style.display = 'none';
			}
		} else {
			removeClass(element, HIDDEN_CLASS);
			if (element.style) {
				if (element.style.removeProperty) {
					element.style.removeProperty('display');
				} else {
					element.style.display = '';
				}
			}
		}
	}

	function ensureHiddenStyle() {
		if (document.getElementById('knp-team-filter-style')) {
			return;
		}
		var style = document.createElement('style');
		style.id = 'knp-team-filter-style';
		style.textContent = '.' + HIDDEN_CLASS + '{display:none !important;}';
		document.head.appendChild(style);
	}

	function setupFilter(wrapper) {
		var grid = wrapper.querySelector('.dt-css-grid');
		var filterLinks = toArray(wrapper.querySelectorAll('.filter-categories a[data-filter]'));

		if (!grid || !filterLinks.length) {
			return;
		}

		var items = toArray(grid.querySelectorAll('.wf-cell'));
		if (!items.length) {
			items = toArray(grid.querySelectorAll('.team-container'));
		}
		if (!items.length) {
			return;
		}

		function applyFilter(filterValue) {
			var target = !filterValue || filterValue === '*'
				? null
				: filterValue.charAt(0) === '.'
					? filterValue.slice(1)
					: filterValue;

			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var show = !target || hasClass(item, target);
				toggleHidden(item, !show);
			}
		}

		function setActiveLink(activeLink) {
			for (var i = 0; i < filterLinks.length; i++) {
				removeClass(filterLinks[i], 'act');
			}
			addClass(activeLink, 'act');
		}

		for (var i = 0; i < filterLinks.length; i++) {
			(function (link) {
				link.addEventListener('click', function (event) {
					var filterValue = link.getAttribute('data-filter');
					if (!filterValue) {
						return;
					}
					if (event && event.preventDefault) {
						event.preventDefault();
					} else if (event) {
						event.returnValue = false;
					}

					setActiveLink(link);
					applyFilter(filterValue);
				});
			})(filterLinks[i]);
		}

		var initial =
			filterLinks.filter
				? filterLinks.filter(function (link) {
						return hasClass(link, 'act');
				  })[0]
				: null;
		if (!initial) {
			for (var j = 0; j < filterLinks.length; j++) {
				if (hasClass(filterLinks[j], 'act')) {
					initial = filterLinks[j];
					break;
				}
			}
		}
		if (!initial) {
			initial = filterLinks[0];
		}
		if (initial) {
			applyFilter(initial.getAttribute('data-filter') || '*');
		}
	}

	ready(function () {
		ensureHiddenStyle();
		var wrappers = document.querySelectorAll('.dt-team-masonry-shortcode');
		for (var i = 0; i < wrappers.length; i++) {
			setupFilter(wrappers[i]);
		}
	});
})();
