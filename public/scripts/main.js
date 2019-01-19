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
		}
	};
}
