import 'codemirror/lib/codemirror.css';
//import 'codemirror/theme/blackboard.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/addon/hint/show-hint.css';
import './codeMirrorEditor.css';

import React, { Component } from 'react';

import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';

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
		this.editor = CodeMirror (this.node.current, {
			value: '',
			mode: 'javascript',
			theme: 'darcula',
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
}

export default CodeMirrorEditor;
