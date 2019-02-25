import './about.css';
import logo from '../image/tomas-chyly.png';

import React, { Component } from 'react';
import Link from '../component/Link';
import Popup from '../component/Popup';

const {ipcRenderer} = window.require ('electron');

class About extends Component {
	/**
	 * About initialization.
	 */
	constructor (props) {
		super (props);

		this.state = {
			contact: false
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('About');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {name, version} = window.TCH.mainParameters;

		return <div className="about">
			<div className="container">
				<div className="row">
					<div className="col-10 about-content">
						<img className="logo" src={logo} alt="Tomáš Chylý"/>
						<p className="version">{name}: {version}</p>

						<p>This app is brought to you by Tomáš Chylý, Full Stack Web/Mobile/Desktop Developer. I started this app to get better with <Link href="https://electronjs.org/">Electron</Link> and to learn <Link href="https://reactjs.org/">React</Link>. I hope you like it!</p>
						<p>If you have any issues with the app, UI or have ideas for improvement, please use the contact form below. Thank you!</p>

						<div className="actions">
							<button type="button" onClick={this.Website.bind (this)}>Website</button>
							<button type="button" onClick={this.Repository.bind (this)}>App Repository</button>
							<button type="button" onClick={this.ContactOpen.bind (this)}>Contact</button>
						</div>

						<p>Icons used in this app are from the great <Link href="https://fontawesome.com/">Font Awesome</Link>. The <Link href="https://fontawesome.com/license/free">free version</Link> is used.</p>
					</div>
				</div>
			</div>

			<Popup className="contact-form" visible={this.state.contact} headline="Contact" content={
				<p>WIP - this will be contact form</p>
			} onClose={this.ContactClosed.bind (this)}/>
		</div>;
	}

	/**
	 * Open website in default browser.
	 */
	Website () {
		ipcRenderer.send ('url-open', {url: 'https://tomas-chyly.com/en/'});
	}

	/**
	 * Open app code repository in default browser.
	 */
	Repository () {
		ipcRenderer.send ('url-open', {url: 'https://github.com/tomaschyly/FileCtor'});
	}

	/**
	 * Open contact form popup.
	 */
	ContactOpen () {
		this.setState ({contact: true});
	}

	/**
	 * Close contact form popup.
	 */
	ContactClosed () {
		this.setState ({contact: false});
	}
}

export default About;
