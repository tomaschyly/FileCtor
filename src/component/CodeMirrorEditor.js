import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/blackboard.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/theme/idea.css';
import 'codemirror/theme/twilight.css';
import 'codemirror/theme/material-darker.css';
import 'codemirror/theme/material-ocean.css';
import 'codemirror/theme/material-palenight.css';
import 'codemirror/theme/material.css';
import 'codemirror/addon/hint/show-hint.css';
import './codeMirrorEditor.css';

import React, { Component } from 'react';

import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';

export const THEMES_AS_OPTIONS = [
	{label: 'Blackboard', value: 'blackboard'},
	{label: 'Darcula', value: 'darcula'},
	{label: 'Default', value: 'default'},
	{label: 'Idea', value: 'idea'},
	{label: 'Material', value: 'material'},
	{label: 'Material Darker', value: 'material-darker'},
	{label: 'Material Ocean', value: 'material-ocean'},
	{label: 'Material Palenight', value: 'material-palenight'},
	{label: 'Twilight', value: 'twilight'}
];

class CodeMirrorEditor extends Component {
	/**
	 * CodeMirrorEditor initialization.
	 */
	constructor (props) {
		super (props);

		this.node = undefined;
		this.editor = undefined;
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		const {settings} = window.TCH.mainParameters;

		this.editor = CodeMirror (this.node.current, {
			value: typeof (this.props.script) !== 'undefined' ? this.props.script : '',
			mode: 'javascript',
			theme: settings.console.theme,
			lineNumbers: true,
			lineWrapping: true,
			extraKeys: {
				'Ctrl-Space': 'autocomplete'
			}
		});

		if (typeof (this.props.onChange) === 'function') {
			this.editor.on ('change', editor => {
				this.props.onChange (editor.getValue ());
			});
		}
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.editor = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		this.node = React.createRef ();

		return <div ref={this.node} className="code-mirror-editor-container" />;
	}

	/**
	 * Change script of the editor.
	 */
	ChangeScript (value) {
		this.editor.getDoc ().setValue (value);
	}
}

export default CodeMirrorEditor;
