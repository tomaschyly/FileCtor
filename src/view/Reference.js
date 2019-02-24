/* eslint-disable no-whitespace-before-property */
import './reference.css';

import React, { Component } from 'react';

class Reference extends Component {
	/**
	 * Reference initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			content: {
				'global-parameters': {
					label: 'Global Parameters',
					content: {
						log: {
							label: 'log',
							description: 'Initial value: empty string\nThis value holds all console.log output which will be shown after script is done executing.'
						},
						result: {
							label: 'result',
							description: 'Initial value: undefined\nValue used to hold arbitrary script execution result. Any value assigned will be converted to string and shown after log output.'
						},
						directory: {
							label: 'directory',
							description: 'Initial value: current selected directory\nThis value has assigned current selected directory of console and it should be used by script for execution.'
						},
						files: {
							label: 'files',
							description: 'Initial value: current selected files\nThis value contains array of currently selected files and should be used by script for execution.'
						}
					}
				},
				'global-functions': {
					label: 'Functions',
					content: {
						'console-log': {
							label: 'console.log ()',
							description: 'Parameters: any[, ...]\nUse this function like you would standard console.log (). Value/s will be shown as output after script is done executing.'
						},
						'path-join': {
							label: 'path.join ()',
							description: 'Parameters: string[, ...]\nUse this function like you would join Nodes path.join ().'
						},
						'ReadDirectory': {
							label: 'ReadDirectory ()',
							description: 'async\nParameters: string[, RegExp]\nFirst parameter is directory path, second is optional filter. Can be awaited. Lists files inside directory.'
						},
						'RenameFiles': {
							label: 'RenameFiles ()',
							description: 'async\nParameters: string, array, string\nFirst parameter is directory containing the files, second is array of file names, third is new name. Can be awaited. Renames files to a new name with number if more than one file.'
						}
					}
				}
			}
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Reference');

		window.TCH.Main.HideNavigation ();
	}

	/**
	 * Render the component into html.
	 */
	render () {
		let content = [];
		for (let index in this.state.content) {
			if (this.state.content.hasOwnProperty (index)) {
				let category = this.state.content [index];

				let categoryContent = [];
				for (let index2 in category.content) {
					if (category.content.hasOwnProperty (index2)) {
						let elementDescription = category.content [index2].description.split ('\n');
						let description = [];
						for (let i = 0; i < elementDescription.length; i++) {
							description.push (<p key={`${index}-${index2}-description-${i}`}>{elementDescription [i]}</p>);
						}

						categoryContent.push (<div className="row" key={`${index}-${index2}`}>
							<div className="col-3 col-lg-2 col-xl-1">
								<p className="label">{category.content [index2].label}</p>
							</div>

							<div className="col-7 col-lg-8 col-xl-9">
								{description}
							</div>
						</div>);
					}
				}

				content.push (<div className="panel" key={index}>
					<h2>{category.label}</h2>
					{categoryContent}
				</div>);
			}
		}

		return <div className="reference">
			<div className="container">
				<div className="row">
					<div className="col-10">
						{content}
					</div>
				</div>
			</div>
		</div>;
	}
}

export default Reference;
