import React from 'react';
import axios from 'axios';
import config from '../../package.json';

export default class Categories extends React.Component{
	constructor(){
		super();
		this.state = {categories:[]};
		this.auth = `?authorization=${localStorage.jwt}`;
		this.fetchCategories();
		this.tableHeaderKey = 0;
	}
	render(){
		console.log("render categories:",localStorage.showCategories);
		if(localStorage.showCategories === "true") return this.renderTable();
		return this.renderTitle();
	}

	renderTable(){
		return (
			<div className="categories">
				<h1>Categories</h1>
				<button onClick={this.hide.bind(this)}>Hide</button>
				<table border="1" width="100%">
					<thead>{this.getTableHeader()}</thead>
					<tbody>{this.getTableRows(this.state.categories)}</tbody>
				</table>
			</div>
		);
	}

	getTableHeader(){
		return (
			<tr key={this.tableHeaderKey++}>
				<th>Name</th>
				<th>Parent</th>
				<th>Rules</th>
				<th>Create Child</th>
				<th>Create Rule</th>
			</tr>
		);
	}

	getTableRows(categories){
		return categories.map(category => this.getTableRow(category));
	}

	getTableRow(category){
		let parent = "";
		if(category.parent !== null) parent = category.parent.name;
	
		return (
			<tr key={category.id}>
				<td>{category.name}</td>
				<td>{parent}</td>
				<td>{this.renderRules(category.category_rules)}</td>
				<td></td>
				<td></td>
			</tr>
		);
	}

	renderRules(rules){
		if(!rules || rules === null || rules.length === 0) return (<i>*none*</i>);
		return rules.map(rule => {
			return (<div key={rule.id} style={{fontFamily:"monospace"}}>{rule.regex}</div>);
		});
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
}