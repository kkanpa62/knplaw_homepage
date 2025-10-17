(function () {
	const ready = (fn) => {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn, { once: true });
		} else {
			fn();
		}
	};

	const setupFilter = (wrapper) => {
		const grid = wrapper.querySelector('.dt-css-grid');
		const filterLinks = Array.from(wrapper.querySelectorAll('.filter-categories a'));

		if (!grid || !filterLinks.length) {
			return;
		}

	// Prefer top-level wf-cell elements for toggling visibility; fall back to team-container.
	let items = Array.from(grid.querySelectorAll('.wf-cell'));
	if (!items.length) {
		items = Array.from(grid.querySelectorAll('.team-container'));
	}
	items = items.filter((item) => item.closest('.dt-css-grid') === grid);

		if (!items.length) {
			return;
		}

		const applyFilter = (filter) => {
			const target =
				!filter || filter === '*' ? null : filter.startsWith('.') ? filter.slice(1) : filter;

			items.forEach((item) => {
				const classes = item.classList;
				const show = !target || classes.contains(target);
				classes.toggle('knp-team-fallback-hidden', !show);
			});
		};

		filterLinks.forEach((link) => {
			link.addEventListener('click', (event) => {
				event.preventDefault();
				const filter = link.dataset.filter || link.getAttribute('data-filter');

				filterLinks.forEach((btn) => btn.classList.remove('act'));
				link.classList.add('act');

				applyFilter(filter);
			});
		});

		// Initialise using whatever link currently holds the act class.
		const active =
			filterLinks.find((link) => link.classList.contains('act')) || filterLinks[0] || null;
		if (active) {
			const filter = active.dataset.filter || active.getAttribute('data-filter');
			applyFilter(filter);
		}
	};

	ready(() => {
		document
			.querySelectorAll('.dt-team-masonry-shortcode')
			.forEach((wrapper) => setupFilter(wrapper));
	});
})();
