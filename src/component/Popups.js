import React, {Component} from 'react';
import Popup from './Popup';

class Popups extends Component {
	/**
	 * Popups initialization.
	 */
	constructor (props) {
		super (props);

		this.confirmAction = undefined;

		this.state = {
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
			<Popup className="auto" visible={this.state.confirm} headline="Confirm Action" content={
				<p>Are you sure you want to do it?</p>
			} onClose={this.ConfirmClosed.bind (this)} acceptVisible={true} accept="Confirm" onAccept={this.ConfirmAccepted.bind (this)}/>
		</div>;
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
