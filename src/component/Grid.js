/* eslint-disable no-whitespace-before-property */
import {ReactComponent as ChevronCircleUp} from '../icon/chevron-circle-up.svg';
import {ReactComponent as ChevronCirceDown} from '../icon/chevron-circle-down.svg';
import {ReactComponent as Eye} from '../icon/eye.svg';
import {ReactComponent as Edit} from '../icon/edit.svg';
import {ReactComponent as Trash} from '../icon/trash-alt.svg';

import React, {Component} from 'react';
import ButtonSelect from './ButtonSelect';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

const uuidV4 = window.require ('uuid/v4');
const {ipcRenderer} = window.require ('electron');
const {WHERE_CONDITIONS} = window.require ('tch-database');

const Grid_static = {
	template: {
		sortAsc: <ChevronCircleUp/>,
		sortDesc: <ChevronCirceDown/>,
		actionView: <Eye/>,
		actionEdit: <Edit/>,
		actionDelete: <Trash/>
	},
	texts: {
		noItems: 'There are no items here.',
		page: 'Page ',
		pageSize: 'Size '
	}
};

class Grid extends Component {
	/**
	 * Grid initialization.
	 */
	constructor (props) {
		super (props);

		this.id = typeof (props.id) !== 'undefined' ? props.id : `tch-grid-${uuidV4 ()}`;
		this.modelName = typeof (props.modelName) !== 'undefined' ? props.modelName : null;
		this.columns = typeof (props.columns) !== 'undefined' ? props.columns : [];
		this.actions = typeof (props.actions) !== 'undefined' ? props.actions : {};
		this.pageSizes = typeof (props.pageSizes) !== 'undefined' ? props.pageSizes : [5, 10, 25, 50, 100];

		if (this.modelName === null) {
			throw Error ('ModelName is required');
		}

		this.state = {
			filter: typeof (props.filter) !== 'undefined' ? props.filter : {},
			items: typeof (props.items) !== 'undefined' ? props.items : [],
			count: typeof (props.count) !== 'undefined' ? props.count : 0,
			page: typeof (props.page) !== 'undefined' ? props.page : 1,
			pages: typeof (props.pages) !== 'undefined' ? props.pages : 0,
			pageSize: typeof (props.pageSize) !== 'undefined' ? props.pageSize : 10,
			sort: typeof (props.sort) !== 'undefined' ? props.sort : 'id',
			sortDirection: typeof (props.sortDirection) !== 'undefined' ? props.sortDirection : 'ASC',
			update: false
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		this.dataUpdatedListener = this.DataUpdated.bind (this);
		ipcRenderer.on ('grid-update', this.dataUpdatedListener);

		this.UpdateData ();
	}

	/**
	 * Component was updated.
	 */
	componentDidUpdate () {
		if (this.state.update) {
			this.UpdateData ();

			this.setState ({
				update: false
			});
		}
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		ipcRenderer.removeListener ('grid-update', this.dataUpdatedListener);
		delete this.dataUpdatedListener;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <div className={`tch-grid${this.state.count === 0 ? ' empty' : ''}`}>
			{this.RenderHeader ()}
			{this.RenderBody ()}
			{this.RenderFooter ()}
		</div>;
	}

	/**
	 * Render Grid header.
	 */
	RenderHeader () {
		let sortRowChildren = [];
		for (let i = 0; i < this.columns.length; i++) {
			let sort = undefined;
			if (typeof (this.columns [i].sort) !== 'undefined' && this.columns [i].sort) {
				let icon = Grid_static.template.sortAsc;
				if (this.columns [i].index === this.state.sort && this.state.sortDirection === 'ASC') {
					icon = Grid_static.template.sortDesc;
				}

				(index => {
					sort = <button type="button" className={`tch-grid-sort icon${this.columns [i].index === this.state.sort ? ' active' : ''}`} data-index={index} onClick={() => { this.ChangeSort (index); }}>{icon}</button>;
				}) (this.columns [i].index);
			}

			sortRowChildren.push (<div key={`${this.id}-header-${this.columns [i].index}`} className="tch-grid-col center">
				<span>{this.columns [i].label}</span>
				{sort}
			</div>);
		}
		if (!window.TCH.Main.Utils.Object.IsEmpty (this.actions)) {
			sortRowChildren.push (<div key={`${this.id}-header-actions`} className="tch-grid-col"/>);
		}
		let sortRow = <div className="tch-grid-row">{sortRowChildren}</div>;

		let atLeastOneFilter = false;
		let filterRowChildren = [];
		for (let i = 0; i < this.columns.length; i++) {
			let filter = undefined;
			if (typeof (this.columns [i].filter) !== 'undefined') {
				switch (this.columns [i].filter) {
					case 'search': {
						atLeastOneFilter = true;

						(index => {
							let value = typeof (this.state.filter [this.columns [i].index]) !== 'undefined' ? this.state.filter [this.columns [i].index].value : '';

							filter = <input type="text" className={`tch-grid-filter-search tch-grid-filter-search-${this.columns [i].index}`} value={value} data-index={index} onChange={e => { this.FilterSearch (index, e.target.value); }}/>;
						}) (this.columns [i].index);
						break;
					}
					default:
						//do nothing
						break;
				}
			}

			filterRowChildren.push (<div key={`${this.id}-header-filter-${this.columns [i].index}`} className="tch-grid-col">{filter}</div>);
		}
		let filterRow = undefined;
		if (atLeastOneFilter) {
			if (!window.TCH.Main.Utils.Object.IsEmpty (this.actions)) {
				filterRowChildren.push (<div key={`${this.id}-header-filter-actions`} className="tch-grid-col"/>);
			}

			filterRow = <div className="tch-grid-row">{filterRowChildren}</div>;
		}

		return <div className="tch-grid-header">
			{sortRow}
			{filterRow}
		</div>;
	}

	/**
	 * Render Grid body.
	 */
	RenderBody () {
		const duration = 400;
		let body = [];

		if (this.state.items.length > 0) {
			for (let i = 0; i < this.state.items.length; i++) {
				let item = this.state.items [i];
				let rowContent = [];

				for (let j = 0; j < this.columns.length; j++) {
					let content = 'N/A';
					if (typeof (item [this.columns [j].index]) !== 'undefined') {
						content = item [this.columns [j].index];
					}

					if (typeof (this.columns [j].renderer) !== 'undefined') {
						content = this.columns [j].renderer (content);
					}

					rowContent.push (<div key={`${this.id}-item-${item.id}-${this.columns [j].index}`} className="tch-grid-col">{content}</div>);
				}

				if (!window.TCH.Main.Utils.Object.IsEmpty (this.actions)) {
					let actions = [];

					for (let index in this.actions) {
						if (this.actions.hasOwnProperty (index)) {
							let icon = null;
							switch (this.actions [index].icon) {
								case 'view':
									icon = Grid_static.template.actionView;
									break;
								case 'edit':
									icon = Grid_static.template.actionEdit;
									break;
								case 'delete':
									icon = Grid_static.template.actionDelete;
									break;
								default:
									throw Error ('Not supported Action type');
							}

							(action => {
								actions.push (<button key={`${this.id}-item-${item.id}-actions-${index}`} type="button" className="tch-grid-action icon" onClick={() => { this.ExecuteAction (item [action.index], action.action, (typeof (action.confirm) !== 'undefined' && action.confirm)); }}>{icon}</button>);
							}) (this.actions [index]);
						}
					}

					rowContent.push (<div key={`${this.id}-item-${item.id}-actions`} className="tch-grid-col right">{actions}</div>);
				}

				body.push (<CSSTransition key={`${this.id}-item-${item.id}`} timeout={duration} classNames="general-flex-fade">
					<div className="tch-grid-row general-flex-fade">{rowContent}</div>
				</CSSTransition>);
			}
		} else {
			body = <CSSTransition key={`${this.id}-item-empty`} timeout={duration} classNames="general-flex-fade">
				<div className="tch-grid-row general-flex-fade">
					<div className="tch-grid-col center">{Grid_static.texts.noItems}</div>
				</div>
			</CSSTransition>;
		}

		return <TransitionGroup className="tch-grid-body">{body}</TransitionGroup>;
	}

	/**
	 * Render Grid footer.
	 */
	RenderFooter () {
		let footer = undefined;

		if (this.state.count > 0) {
			let pageOptions = [];
			for (let i = 1; i <= this.state.pages; i++) {
				pageOptions.push ({
					id: `${this.id}-footer-page-${i}`,
					value: i,
					label: i
				});
			}

			let page = <div className="tch-grid-page">
				<span>{Grid_static.texts.page}</span>
				<ButtonSelect options={pageOptions} value={this.state.page} onSelectItem={e => { this.ChangePage (parseInt (e.target.dataset.value)); }} />
			</div>;

			let pageSizeOptions = [];
			for (let i = 0; i < this.pageSizes.length; i++) {
				pageSizeOptions.push ({
					id: `${this.id}-footer-pagesize-${this.pageSizes [i]}`,
					value: this.pageSizes [i],
					label: this.pageSizes [i]
				});
			}

			let pageSize = <div className="tch-grid-pagesize">
				<span>{Grid_static.texts.pageSize}</span>
				<ButtonSelect options={pageSizeOptions} value={this.state.pageSize} onSelectItem={e => { this.ChangePageSize (parseInt (e.target.dataset.value)); }} />
			</div>;

			footer = <div className="tch-grid-row">
				<div className="tch-grid-col center">
					{page}
					{pageSize}
				</div>
			</div>;
		}

		return <div className="tch-grid-footer">{footer}</div>;
	}

	/**
	 * Request data update from API.
	 */
	UpdateData () {
		let parameters = {
			modelName: this.modelName,
			filter: this.state.filter,
			page: this.state.page,
			pageSize: this.state.pageSize,
			sort: this.state.sort,
			sortDirection: this.state.sortDirection
		};

		ipcRenderer.send ('grid-update', parameters);
	}

	/**
	 * Receive data update from API.
	 */
	DataUpdated (event, message) {
		this.setState ({
			count: message.count,
			items: message.items,
			pages: message.pages
		});
	}

	/**
	 * Change grid sort.
	 */
	ChangeSort (sort) {
		let update = {
			sort: this.state.sort,
			sortDirection: this.state.sortDirection,
			update: true
		};

		if (sort === this.state.sort) {
			if (this.state.sortDirection === 'ASC') {
				update.sortDirection = 'DESC';
			} else {
				update.sortDirection = 'ASC';
			}
		} else {
			update.sort = sort;
			update.sortDirection = 'ASC';
		}

		this.setState (update);
	}

	/**
	 * Filter by search if changed.
	 */
	FilterSearch (filter, value) {
		let update = {
			filter: this.state.filter,
			update: false
		};

		if (value.length > 0) {
			update.filter [filter] = {
				value: value,
				condition: WHERE_CONDITIONS.Like
			};
		} else if (typeof (update.filter [filter]) !== 'undefined') {
			delete update.filter [filter];
		}

		this.setState (update);

		if (typeof (this.timeoutInProgress) !== 'undefined') {
			clearTimeout (this.timeoutInProgress);
			delete this.timeoutInProgress;
		}

		this.timeoutInProgress = setTimeout (() => {
			this.setState ({
				update: true
			});
		}, 200);
	}

	/**
	 * Execute action on row.
	 */
	ExecuteAction (id, action, confirm = false) {
		if (confirm) {
			let confirmAction = () => {
				action (id);
			};

			window.TCH.Main.ConfirmAction (confirmAction);
		} else {
			action (id);
		}
	}

	/**
	 * Change current page.
	 */
	ChangePage (page) {
		this.setState ({
			page: page,
			update: true
		});
	}

	/**
	 * Change current pageSize.
	 */
	ChangePageSize (pageSize) {
		this.setState ({
			pageSize: pageSize,
			update: true
		});
	}
}

export default Grid;
