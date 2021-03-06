import './about.css';
import logo from '../image/tomas-chylyV2-sign.png';
import {ReactComponent as Github} from '../icon/github.svg';
import {ReactComponent as Npm} from '../icon/npm.svg';
import {ReactComponent as StackOverflow} from '../icon/stack-overflow.svg';
import {ReactComponent as Twitter} from '../icon/twitter.svg';
import {ReactComponent as LinkedIn} from "../icon/linkedin.svg";

import React, { Component } from 'react';
import Button from '../component/Button';
import Link from '../component/Link';
import Popup from '../component/Popup';
import Form from '../component/Form';

const {ipcRenderer} = window.require ('electron');

class About extends Component {
	/**
	 * About initialization.
	 */
	constructor (props) {
		super (props);

		this.contactForm = undefined;

		this.state = {
			contact: false,
			contactSending: false
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.SetTitle ('About');

		this.onMessageResultListener = this.SendMessageResult.bind (this);
		ipcRenderer.on ('contact-message-send', this.onMessageResultListener);
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		this.contactForm = undefined;

		ipcRenderer.removeListener ('contact-message-send', this.onMessageResultListener);
		delete this.onMessageResultListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {name, version} = window.TCH.mainParameters;
		const {contactSending} = this.state;

		this.contactForm = React.createRef ();

		return <div className="about">
			<div className="container">
				<div className="row">
					<div className="col-10 about-content">
						<img className="logo" src={logo} alt="Tomáš Chylý"/>
						<p className="version">{name}: {version}</p>

						<p>This app is brought to you by Tomáš Chylý, Full Stack Web/Mobile/Desktop Developer. I started this app to get better with <Link href="https://electronjs.org/">Electron</Link> and to learn <Link href="https://reactjs.org/">React</Link>. I hope you like it!</p>
						<p>If you have any issues with the app, UI or have ideas for improvement, please use the contact form below. Thank you!</p>

						<div className="actions">
							<Button type="button" onClick={this.Website.bind (this)}>Website</Button>
							<Button type="button" onClick={this.Repository.bind (this)}>App Repository</Button>
							<Button type="button" onClick={this.ContactOpen.bind (this)}>Contact</Button>
						</div>

						<div className="socials">
							<Button type="button" className="button icon icon-larger" onClick={this.LinkedIn.bind (this)}><LinkedIn/></Button>
							<Button type="button" className="button icon icon-larger" onClick={this.Twitter.bind (this)}><Twitter/></Button>
							<Button type="button" className="button icon icon-larger last-row" onClick={this.Github.bind (this)}><Github/></Button>
							<div className="flex-break"/>
							<Button type="button" className="button icon icon-larger" onClick={this.Npm.bind (this)}><Npm/></Button>
							<Button type="button" className="button icon icon-larger" onClick={this.StackOverflow.bind (this)}><StackOverflow/></Button>
						</div>

						<p>Icons used in this app are from the great <Link href="https://fontawesome.com/">Font Awesome</Link>. The <Link href="https://fontawesome.com/license/free">free version</Link> is used.</p>
					</div>
				</div>
			</div>

			<Popup className="contact-form" visible={this.state.contact} headline="Contact" content={
				<Form ref={this.contactForm} inputs={{
					name: {
						label: 'Name',
						type: 'text',
						value: '',
						required: true
					},
					email: {
						label: 'Email (optional)',
						type: 'email',
						value: ''
					},
					subject: {
						label: 'Subject (optional)',
						type: 'text',
						value: ''
					},
					message: {
						label: 'Message',
						type: 'textarea',
						value: '',
						required: true
					},
					gdpr: {
						label: 'I agree with use of my personal information for the sole purpose of communication',
						type: 'checkbox',
						value: false,
						required: true
					}
				}} onSubmit={this.SendMessage.bind (this)}/>
			} onClose={this.ContactClosed.bind (this)} acceptVisible={true} accept="Submit" onAccept={this.ContactAccepted.bind (this)} loading={contactSending}/>
		</div>;
	}

	/**
	 * Open website in default browser.
	 */
	Website () {
		ipcRenderer.send ('url-open', {url: 'https://tomas-chyly.com/en/project/filector/'});
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

	/**
	 * Submit contact form, then send message to API.
	 */
	ContactAccepted () {
		this.contactForm.current.Submit ();
	}

	/**
	 * Send message to API and close contact form popup.
	 */
	SendMessage (values) {
		this.setState ({contactSending: true});

		ipcRenderer.send ('contact-message-send', values);
	}

	/**
	 * Send message result is error or success, show result and close popup.
	 */
	SendMessageResult (event, message) {
		this.setState ({contactSending: false});

		if (typeof (message.success) !== 'undefined') {
			window.TCH.Main.Alert ('Message sent successfully, thank you!', 'Message Sent');

			this.setState ({contact: false});
		} else {
			window.TCH.Main.Alert ('I am sorry, but I have failed to send the message. Are you connected to the Internet? Do you want to try again?', 'Message Failed');
		}
	}

	/**
	 * Open LinkedIn in default browser.
	 */
	LinkedIn () {
		ipcRenderer.send ('url-open', {url: 'https://www.linkedin.com/in/tomas-chyly/'});
	}

	/**
	 * Open github in default browser.
	 */
	Github () {
		ipcRenderer.send ('url-open', {url: 'https://github.com/tomaschyly'});
	}

	/**
	 * Open npm in default browser.
	 */
	Npm () {
		ipcRenderer.send ('url-open', {url: 'https://www.npmjs.com/~tomaschyly'});
	}

	/**
	 * Open stackoverflow in default browser.
	 */
	StackOverflow () {
		ipcRenderer.send ('url-open', {url: 'https://stackoverflow.com/users/1979892/tom%C3%A1%C5%A1-chyl%C3%BD'});
	}

	/**
	 * Open twitter in default browser.
	 */
	Twitter () {
		ipcRenderer.send ('url-open', {url: 'https://twitter.com/TomasChyly'});
	}
}

export default About;
