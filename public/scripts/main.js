if (typeof (window.TCH) === 'undefined') {
	window.TCH = {};
}

if (typeof (window.TCH.Main) === 'undefined') {
	window.TCH.Main = {
		titleBar: null,

		/**
		 * Set new document title.
		 */
		SetTitle (title) {
			let element = document.getElementById ('document-title');

			if (typeof (title) === 'string' && title.length > 0) {
				document.title = `${title} - ${element.dataset.title}`;
			} else {
				document.title = element.dataset.title;
			}

			if (this.titleBar !== null) {
				this.titleBar.setState ({title: document.title});
			}
		},

		Utils: {
			/**
			 * Find closest parent node with class or tag name for element.
			 * @param {Element} element Element from which to search parent
			 * @param {string} parentClass Class of searched for parent
			 * @returns {null|Element}
			 */
			FindNearestParent (element, parentClass, tagName) {
				let parent = element.parentElement;

				do {
					if (parent !== null && (typeof (parentClass) !== 'undefined' && parent.classList.contains (parentClass))) {
						return parent;
					} else if (parent !== null && (typeof (tagName) !== 'undefined' && parent.tagName === tagName)) {
						return parent;
					}

					parent = parent !== null ? parent.parentElement : null;
				} while (parent !== null);

				return null;
			}
		}
	};
}