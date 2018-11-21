import React from 'react';
import axios from 'axios';
import config from '../../package.json';
import Rules from "./Rules.jsx"
import TransactionModel from "../models/Transactions.jsx";

export default class Categories extends React.Component{
	constructor(){
		super();
		this.state = {categories:[],children:{}};
		this.auth = `?authorization=${localStorage.jwt}`;
		this.fetchCategories();
		this.tableHeaderKey = 0;
		this.flattenRulesThreshhold = 5;
		this.info = null;
		TransactionModel.on("updated",() => this.forceUpdate());
	}
	render(){
		if(localStorage.showCategories === "true") return this.renderTable();
		return this.renderTitle();
	}

	renderTable(){
		return (
			<div className="categories">
				<h1>Categories</h1>
				<div>
					<button onClick={this.hide.bind(this)}>Hide</button>
					<button onClick={this.fetchCategories.bind(this)}>Reload</button>
					<button onClick={this.autoCategorize.bind(this)}>Auto-Categorize</button>
				</div>
				<br />
				<div><span>{this.uncategorized()} Uncategorized Transactions</span></div>
				<br />
				<div>
					<input type="text" onChange={this.setNewCategoryName.bind(this)} />
					<button onClick={this.createCategory.bind(this)}>Create New Category</button>
				</div>
				<br />
				<table width="100%">
					<thead>{this.getTableHeader()}</thead>
					<tbody>{this.getTableRows(this.state.categories)}</tbody>
				</table>
				{this.info}
			</div>
		);	
	}

	uncategorized(){
		return TransactionModel.getTransactions().filter(trx => trx.categories.length === 0).length;
	}

	getTableHeader(){
		return (
			<tr key={this.tableHeaderKey++}>
				<th>Name</th>
				<th>Rules</th>
				<th>Delete</th>
			</tr>
		);
	}

	getTableRows(categories){
		return categories.map(category => this.getTableRow(category));
	}

	getTableRow(category){
		return (
			<tr key={category.id}>
				<td>{category.name}</td>	
				<td onClick={this.showRules.bind(this,category)}>{this.renderRules(category.category_rules)}</td>
				<td style={{width:'1px',minWidth:'fit-content',whiteSpace:'nowrap'}}>
					<button onClick={this.deleteCategory.bind(this,category)}>Delete</button>
				</td>
			</tr>
		);
	}

	deleteCategory(category){
		let url = `${config.config.backend}/v1/Categorization/Category${this.auth}&id=${category.id}`;
		return axios.delete(url).then(this.fetchCategories.bind(this));
	}

	setChildName(category,event){
		this.setState({children:{...this.state.children,[category.id]: event.target.value}});
	}

	setNewCategoryName(event){
		this.setState({newCategoryName:event.target.value});
	}

	createCategory(){
		let url = `${config.config.backend}/v1/Categorization/CreateCategory${this.auth}`;
		return axios.post(url,{
			name: this.state.newCategoryName
		}).then(this.fetchCategories.bind(this));
	}

	renderRules(rules){
		if(!rules || rules === null || rules.length === 0) return (<i>*none*</i>);

		if(rules.length < this.flattenRulesThreshhold ) return rules.map(rule => {
			return (<div key={rule.id} style={{fontFamily:"monospace"}}>{rule.regex}</div>);
		});
		return (<i>{rules.length} Rules</i>);
	}

	renderTitle(){
		return (
			<div className="categories">
				<h1>Categories</h1>
				<button onClick={this.show.bind(this)}>Show</button>
			</div>
		);
	}

	show(){
		localStorage.setItem("showCategories",true);
		this.fetchCategories();
	}

	hide(){
		localStorage.setItem("showCategories",false);
		this.forceUpdate();
	}

	fetchCategories(){
		let url = `${config.config.backend}/v1/Categorization/Categories${this.auth}`;
		return axios.get(url).then(result => this.setState({categories:result.data}));
	}

	autoCategorize(){
		let url = `${config.config.backend}/v1/Categorization/Categorize${this.auth}`;
		return axios.put(url).then(() => TransactionModel.fetchTransactions()).catch(console.error);
	}

	showRules(category){
		this.info = (<Rules category={category} />);
		this.forceUpdate();
	}
}