import './fileInspector.css';

import React, { Component } from 'react';
import Tabs from '../component/Tabs';

class FileInspector extends Component {
	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Files');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <div className="file-inspector">
			<Tabs startWith="1" tabParameters={this.TabParameters.bind (this)} onTabSelected={this.TabSelected.bind (this)} />
			<div className="container bottom">
				<div className="row">
					<div className="col-10">
						<input id="current-directory" type="text" />
					</div>
				</div>
			</div>
		</div>;
	}

	/**
	 * Return parameters for Tab.
	 */
	TabParameters (params) {
		params.tag = 'FileInspector';

		if (typeof (params.directory) === 'undefined') {
			params.directory = window.TCH.mainParameters.directory.documents;
		}

		if (params.directory.includes ('\\')) {
			params.title = params.directory.split ('\\').pop ();
		} else {
			params.title = params.directory.split ('/').pop ();
		}

		params.content = this.TabContent.bind (this);

		return params;
	}

	/**
	 * Return content for Tab.
	 */
	TabContent (params) {
		return <p>WIP - content for {params.title}</p>;
	}

	/**
	 * Callback for when Tab is selected.
	 */
	TabSelected (params) {
		if (typeof (params) !== 'undefined') {
			document.getElementById ('current-directory').value = params.directory;
		}
	}
}

export default FileInspector;
