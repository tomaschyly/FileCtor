import React, {Component} from 'react';
import Popup from './Popup';

const {ipcRenderer} = window.require ('electron');

class Popups extends Component {
	/**
	 * Popups initialization.
	 */
	constructor (props) {
		super (props);

		this.confirmAction = undefined;

		this.state = {
			beta: false,
			confirm: false
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.popups = this;
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		window.TCH.Main.popups = null;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <div className="general-popups">
			<Popup visible={this.state.beta} headline="Beta" content={
				<div>
					<p>Please be aware that this is a beta App currently under development.</p>
					<p>There may be bugs and there are missing features.</p>
				</div>
			} onClose={this.BetaClosed.bind (this)}/>

			<Popup className="auto" visible={this.state.confirm} headline="Confirm Action" content={
				<p>Are you sure you want to do it?</p>
			} onClose={this.ConfirmClosed.bind (this)} acceptVisible={true} accept="Confirm" onAccept={this.ConfirmAccepted.bind (this)}/>
		</div>;
	}

	/**
	 * Show beta popup.
	 */
	Beta () {
		this.setState ({beta: true});
	}

	/**
	 * Close beta popup.
	 */
	BetaClosed () {
		ipcRenderer.send ('config-set', {key: 'app-beta', value: true});

		this.setState ({beta: false});
	}

	/**
	 * Show popup to ask user for action confirmation.
	 */
	ConfirmAction (action) {
		this.confirmAction = action;

		this.setState ({confirm: true});
	}

	/**
	 * Confirm popup vas canceled.
	 */
	ConfirmClosed () {
		this.confirmAction = undefined;

		this.setState ({confirm: false});
	}

	/**
	 * Confirm popup was confirmed, run action.
	 */
	ConfirmAccepted () {
		this.setState ({confirm: false});

		if (typeof (this.confirmAction) === 'function') {
			this.confirmAction ();

			this.confirmAction = undefined;
		}
	}
}

export default Popups;
