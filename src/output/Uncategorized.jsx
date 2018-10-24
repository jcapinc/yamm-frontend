import React from 'react';
import axios from 'axios';
import config from '../../package.json';
import CategoryModel from '../models/Categories.jsx';
import TransactionModel from '../models/Transactions.jsx';

export default class Uncategorized extends React.Component{
	constructor(){
		super();
		this.state = {data:[]};
		this.auth = `?authorization=${localStorage.jwt}`;
		this.headerCount = 0;
		this.getData();
	}
	render(){
		console.log("rendering uncategorized",localStorage.showUncategorized);
		if(localStorage.showUncategorized === "true"){
			return this.renderTable();
		}
		return this.renderTeaser();
	}

	renderTeaser(){
		return (
			<div className="uncategorized">
				<h1>Uncategorized Transactions</h1>
				<span>{this.state.data.length} Uncategorized Transactions <br /></span>
				<button onClick={this.show.bind(this)}>Show</button>
				<button onClick={this.getData.bind(this)}>Reload</button>
			</div>
		);
	}

	renderTable(){
		let rows = [];
		let i = 0;
		for(let record of this.state.data){
			if(++i % 30 === 0) rows.push(this.getHeader());
			rows.push(this.getTableRow(record));
		}
		return (
			<div className="uncategorized">
				<h1>Uncategorized Transactions</h1>
				<button onClick={this.hide.bind(this)}>Hide</button>
				<button onClick={this.getData.bind(this)}>Reload</button>
				<table border="1" width="100%">
					<thead>{this.getHeader()}</thead>
					<tbody>{rows}</tbody>
				</table>
			</div>
		);
	}

	getHeader(){
		return (
			<tr key={this.headerCount++}>
				<th>Date</th>
				<th>Description</th>
				<th>Debit</th>
				<th>Credit</th>
				<th>Date</th>
				<th>Categorize</th>
				<th>Rule</th>
			</tr>
		);
	}

	getTableRow(record){
		let date = new Date(record.date);
		return (
			<tr key={record.id}>
				<td>{record.date}</td>
				<td>{record.description}</td>
				<td>{record.debit}</td>
				<td>{record.credit}</td>
				<td>{date.getMonth()+1}/{date.getDate()}/{date.getFullYear()}</td>
				<td>{this.getCategorySelect(record)}</td>
				<td></td>
			</tr>
		);
	}

	getCategorySelect(record){
		return (
			<select onChange={this.categorize.bind(this,record)}>
				{this.state.categoryOptions}
			</select>
		);
	}

	categorize(record,event){
		return CategoryModel.categorizeTransaction(event.target.value,record.id)
			.then(TransactionModel.fetchTransactions);
	}

	getData(){
		this.getCategories();
		return this.getUncategorizedTransactions();
	}

	getCategories(){
		let url = `${config.config.backend}/v1/Categorization/Categories${this.auth}`;
		return axios.get(url).then(result => {
			const categoryOptions = result.data.sort((cat1,cat2) => ('' + cat1.name).localeCompare(cat2.name)).map(category => 
				(<option key={category.id} value={category.id}>{category.name}</option>));
			categoryOptions.unshift((<option key={0} value={null}>-- Choose Category --</option>));
			this.setState({categories:result.data,categoryOptions:categoryOptions});
		});
	}

	getUncategorizedTransactions(){
		let url = `${config.config.backend}/v1/Categorization/Uncategorized${this.auth}`;
		return axios.get(url).then(result => {
			this.setState({data:result.data});
		});
	}

	show(){
		this.getData();
		localStorage.setItem("showUncategorized",true);
		this.forceUpdate();
	}
	
	hide(){
		localStorage.setItem("showUncategorized",false);
		console.log("hiding",localStorage.showUncategorized);
		this.forceUpdate();
	}
}