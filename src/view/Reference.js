/* eslint-disable no-whitespace-before-property */
import './reference.css';

import React, { Component } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

class Reference extends Component {
	/**
	 * Reference initialization.
	 */
	constructor (props) {
		super (props);

		this.content = {
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
					'fs-createReadStream': {
						label: 'fs.createReadStream ()',
						description: 'Parameters: string, object\nUse this function like you would join Node\'s fs.createReadStream ().'
					},
					'fs-createWriteStream': {
						label: 'fs.createWriteStream ()',
						description: 'Parameters: string, object\nUse this function like you would join Node\'s fs.createWriteStream ().'
					},
					'path-extname': {
						label: 'path.extname ()',
						description: 'Parameter: string\nUse this function like you would join Node\'s path.extname ().'
					},
					'path-join': {
						label: 'path.join ()',
						description: 'Parameters: string[, ...]\nUse this function like you would join Node\'s path.join ().'
					},
					'ReadDirectory': {
						label: 'ReadDirectory ()',
						description: 'async\nParameters: string[, RegExp]\nFirst parameter is directory path, second is optional filter. Can be awaited. Lists files inside directory.'
					},
					'readline-createInterface': {
						label: 'readline.createInterface ()',
						description: 'Parameter: object\nUse this function like you would join Node\'s readline.createInterface ().'
					},
					'RenameFiles': {
						label: 'RenameFiles ()',
						description: 'async\nParameters: string, array, string\nFirst parameter is directory containing the files, second is array of file names, third is new name. Can be awaited. Renames files to a new name with number if more than one file.'
					}
				}
			}
		};

		this.state = {
			query: '',
			content: {}
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('Reference');

		window.TCH.Main.HideNavigation ();

		this.ContentBySearch ('');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const duration = 400;

		let content = [];
		for (let index in this.state.content) {
			if (this.state.content.hasOwnProperty (index)) {
				const category = this.state.content [index];

				let categoryContent = [];
				for (let index2 in category.content) {
					if (category.content.hasOwnProperty (index2)) {
						let elementDescription = category.content [index2].description.split ('\n');
						let description = [];
						for (let i = 0; i < elementDescription.length; i++) {
							description.push (<p key={`${index}-${index2}-description-${i}`}>{elementDescription [i]}</p>);
						}

						categoryContent.push (<CSSTransition key={`${index}-${index2}`} timeout={duration} classNames="general-fade" unmountOnExit>
							<div className="row general-fade">
								<div className="col-3 col-lg-2 col-xl-1">
									<p className="label">{category.content [index2].label}</p>
								</div>

								<div className="col-7 col-lg-8 col-xl-9">
									{description}
								</div>
							</div>
						</CSSTransition>);
					}
				}

				if (categoryContent.length === 0) {
					categoryContent.push (<CSSTransition key={`${index}-empty`} timeout={duration} classNames="general-fade" unmountOnExit>
						<div className="row general-fade">
							<div className="col-10">
								<p>Nothing found here.</p>
							</div>
						</div>
					</CSSTransition>);
				}

				content.push (<div key={index} className="panel">
					<h2>{category.label}</h2>

					<TransitionGroup appear>
						{categoryContent}
					</TransitionGroup>
				</div>);
			}
		}

		return <div className="reference">
			<div className="container">
				<div className="row">
					<div className="col-10">
						<input type="text" value={this.state.query} name="filter-content" id="filter-content" placeholder="Search query" onChange={e => this.ContentBySearch (e.target.value)}/>
					</div>

					<div className="col-10">
						{content}
					</div>
				</div>
			</div>
		</div>;
	}

	/**
	 * Filter content by search in both label and description.
	 */
	ContentBySearch (value) {
		let content = {};

		for (let index in this.content) {
			if (this.content.hasOwnProperty (index)) {
				const category = this.content [index];

				let categoryContent = {};
				for (let index2 in category.content) {
					if (category.content.hasOwnProperty (index2)) {
						if (category.content [index2].label.indexOf (value) >= 0 || category.content [index2].description.indexOf (value) >= 0) {
							categoryContent [index2] = category.content [index2];
						}
					}
				}

				content [index] = {
					label: this.content [index].label,
					content: categoryContent
				};
			}
		}

		this.setState ({
			query: value,
			content: content
		});
	}
}

export default Reference;
