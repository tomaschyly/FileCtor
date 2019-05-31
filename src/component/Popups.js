import React, {Component} from 'react';
import Popup from './Popup';
import Link from './Link';

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
			alert: null,
			alertMessage: '',
			alertHeadline: '',
			confirm: false,
			update: false
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		window.TCH.Main.popups = this;
	}

	/**
	 * Component was updated.
	 */
	componentDidUpdate (prevProps) {
		const {updateAvailable} = this.props;

		if (prevProps.updateAvailable !== updateAvailable && typeof updateAvailable === 'object' && typeof updateAvailable.notified === 'undefined') {
			this.setState ({update: true});
		}
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
		const {updateAvailable} = this.props;
		const {update} = this.state;

		let updatePopup = null;
		if (updateAvailable !== null) {
			updatePopup = <Popup visible={update} headline="Update Available" content={
				<div>
					<p>There is new update ({updateAvailable.newVersion}) available.</p>

					{updateAvailable.downloadUrl !== '' ? <p><Link href={updateAvailable.downloadUrl} onClick={this.UpdateClosed.bind (this)}>Download the update</Link></p> : null}
				</div>
			} onClose={this.UpdateClosed.bind (this)}/>;
		}

		return <div className="general-popups">
			<Popup visible={this.state.beta} headline="Beta" content={
				<div>
					<p>Please be aware that this is a beta App currently under development.</p>
					<p>There may be bugs and there are missing features.</p>
				</div>
			} onClose={this.BetaClosed.bind (this)}/>

			<Popup className="auto" visible={this.state.alert} headline={this.state.alertHeadline} content={
				<p>{this.state.alertMessage}</p>
			} onClose={this.AlertClosed.bind (this)}/>

			<Popup className="auto" visible={this.state.confirm} headline="Confirm Action" content={
				<p>Are you sure you want to do it?</p>
			} onClose={this.ConfirmClosed.bind (this)} acceptVisible={true} accept="Confirm" onAccept={this.ConfirmAccepted.bind (this)}/>

			{updatePopup}
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
	 * Show alert popup.
	 */
	Alert (message, headline) {
		this.setState ({
			alert: true,
			alertMessage: message,
			alertHeadline: headline
		});
	}

	/**
	 * Close alert popup.
	 */
	AlertClosed () {
		this.setState ({
			alert: false
		});
	}

	/**
	 * Show popup to ask user for action confirmation.
	 */
	ConfirmAction (action) {
		this.confirmAction = action;

		this.setState ({confirm: true});
	}

	/**
	 * Confirm popup was canceled.
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

	/**
	 * Close update popup.
	 */
	UpdateClosed () {
		const {updateAvailable} = this.props;

		updateAvailable.notified = true;

		window.App_static.Instance.setState ({
			updateAvailable: updateAvailable
		});

		this.setState ({update: false});
	}
}

export default Popups;
