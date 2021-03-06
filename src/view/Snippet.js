import './snippet.css';

import React, { Component } from 'react';
import Button from '../component/Button';
import Grid from '../component/Grid';

const {ipcRenderer} = window.require ('electron');

class Snippet extends Component {
	/**
	 * Snippet initialization.
	 */
	constructor (props) {
		super (props);

		this.grid = undefined;
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Snippets');

		this.snippetLoadListener = this.EditSnippetLoaded.bind (this);
		ipcRenderer.on ('snippet-load', this.snippetLoadListener);

		this.snippetSavedListener = () => {
			this.grid.current.UpdateData ();
		};
		ipcRenderer.on ('snippet-saved', this.snippetSavedListener);
		ipcRenderer.on ('snippet-delete', this.snippetSavedListener);
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.grid = undefined;

		ipcRenderer.removeListener ('snippet-load', this.snippetLoadListener);
		delete this.snippetLoadListener;

		ipcRenderer.removeListener ('snippet-saved', this.snippetSavedListener);
		ipcRenderer.removeListener ('snippet-delete', this.snippetSavedListener);
		delete this.snippetSavedListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const descriptionRenderer = value => {
			if (typeof (value) === 'string' && value.length > 65) {
				return `${value.substring (0, 62)}...`;
			} else {
				return value;
			}
		};
		const dateRenderer = value => {
			let date = new Date (parseInt (value) * 1000);
			return date.toLocaleDateString ();
		};

		const columns = [
			{
				index: 'name',
				label: 'Name',
				sort: true,
				filter: 'search'
			},
			{
				index: 'description',
				label: 'Description',
				sort: false,
				filter: 'search',
				renderer: descriptionRenderer
			},
			{
				index: 'created',
				label: 'Created',
				sort: true,
				renderer: dateRenderer
			}
		];
		const actions = {
			edit: {
				index: 'id',
				label: 'Edit Snippet',
				labelIndex: 'name',
				action: this.EditSnippet.bind (this),
				icon: 'edit'
			},
			delete: {
				index: 'id',
				label: 'Delete Snippet',
				labelIndex: 'name',
				action: this.DeleteSnippet.bind (this),
				icon: 'delete',
				confirm: true
			}
		};

		this.grid = React.createRef ();

		return <div className="snippet">
			<div className="container">
				<div className="row">
					<div className="col-10">
						<Button type="button" className="button f-right" onClick={this.NewSnippet.bind (this)}>New Snippet</Button>

						<Grid ref={this.grid} modelName="RxSnippet" columns={columns} actions={actions}/>
					</div>
				</div>
			</div>
		</div>;
	}

	/**
	 * Open Console to create new Snippet.
	 */
	NewSnippet () {
		let params = {
			directory: window.TCH.mainParameters.directory.documents,
			snippet: {
				id: undefined,
				name: 'New Snippet',
				description: ''
			},
			loadEnabled: false
		};

		window.TCH.Main.OpenConsole (params);
	}

	/**
	 * Open Console to edit existing Snippet.
	 * But first load Snippet.
	 */
	EditSnippet (id) {
		ipcRenderer.send ('snippet-load', {id: id});
	}

	/**
	 * Snippet loaded, open console.
	 */
	EditSnippetLoaded (event, message) {
		if (typeof (message.error) === 'undefined') {
			let params = {
				directory: window.TCH.mainParameters.directory.documents,
				snippet: message,
				loadEnabled: false
			};

			window.TCH.Main.OpenConsole (params);
		}
	}

	/**
	 * Delete snippet.
	 */
	DeleteSnippet (id) {
		ipcRenderer.send ('snippet-delete', {id: id});
	}
}

export default Snippet;
