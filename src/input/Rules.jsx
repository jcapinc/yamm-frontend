import React from 'react';
import axios from 'axios';
import config from '../../package.json';

export default class Rules extends React.Component{

	constructor(props){
		super(props);
		this.state = {categories:[],categoryOptions:[],transactions:[]};
		this.auth = `?authorization=${localStorage.jwt}`;
		this.getCategories();
		this.headerCount = 0;
	}

	render(){
		return (
			<div className="rules">
				<h1>Rules</h1>
				<button onClick={this.getCategories.bind(this)}>Reload</button>
				<div><label htmlFor="regex">Regular Expression</label></div>
				<div>
					<select name="category" value={this.state.category} onChange={this.setCategory.bind(this)}>
						{this.state.categoryOptions}
					</select>
					<input type="text" name="regex" onChange={this.setRegex.bind(this)} onKeyUp={this.inputKeyUp.bind(this)} />
					<button onClick={this.testRegex.bind(this)}>Test</button>
					<button onClick={this.createRule.bind(this)} disabled={!this.canCreateRule.bind(this)}>Create Rule</button>
				</div>
				{this.renderTransactionTable()}
				<div style={{height:"300px"}}></div>
			</div>
		);
	}

	inputKeyUp(event){
		if(event.which !== 13) return true;
		this.setRegex.call(this,event);
		return this.testRegex.call(this);
	}
	
	createRule(){
		let url = `${config.config.backend}/v1/Categorization/CreateRule${this.auth}`;
		return axios.post(url,{
			category: this.state.category,
			regex: this.state.regex
		}).then(result => {
			const select = document.querySelector(".rules select[name=category]");
			select.getElementsByTagName("option")[0].selected = "selected";
			document.querySelector(".rules input[name=regex]").value = "";
			select.focus();
		});
	}

	canCreateRule(){
		return this.state.category && this.state.regex;
	}

	clearTransactionList(){
		this.setState({transactions:[]});
	}

	renderTransactionTable(){
		if(this.state.transactions.length === 0) return "";
		return (
			<div className="rule-transaction-table">
				<span>
					Count:{this.state.transactions.length}  &nbsp; | &nbsp;
					Debit Totals: {this.getTransactionDebits()} &nbsp; | &nbsp;
					Credit Totals: {this.getTransactionCredits()} &nbsp; | &nbsp;
				</span>
				<button onClick={this.clearTransactionList.bind(this)}>Hide Results</button>
				<table width="100%">
					<thead>{this.renderTransactionHeader()}</thead>
					<tbody>{Object.values(this.state.transactions).map(record => this.renderTransactionRow(record))}</tbody>
				</table>
			</div>
		);
	}

	getTransactionDebits(){
		return Math.round(this.state.transactions.reduce((sum,record) => record.debit + sum,0),2);
	}
	getTransactionCredits(){
		return Math.round(this.state.transactions.reduce((sum,record) => record.credit + sum,0),2);
	}
	
	testRegex(){
		let url = `${config.config.backend}/v1/Categorization/TestRegex${this.auth}&regex=${this.state.regex}`;
		return axios.get(url).then(result => {
			console.log(result);
			this.setState({transactions: result.data.data});
		});
	}

	setRegex(event){
		this.setState({regex:event.target.value});
	}

	setCategory(event){
		this.setState({category:event.target.value})
	}

	getCategories(){
		let url = `${config.config.backend}/v1/Categorization/Categories${this.auth}`;
		return axios.get(url).then(result => {
			let categoryOptions = [(<option key={0} value={null}>-- Choose Category --</option>)];
			for(let category of result.data){
				categoryOptions.push((
					<option key={category.id} value={category.id}>{category.name}</option>
				));
			}
			this.setState({categories:result.data,categoryOptions:categoryOptions});
		});
	}

	renderTransactionHeader(){
		return (
			<tr key={this.headerCount++}>
				<th>Date</th>
				<th>Description</th>
				<th>Debit</th>
				<th>Credit</th>
			</tr>
		);
	}

	renderTransactionRow(record){
		return (
			<tr key={record.id}>
				<td>{record.date}</td>
				<td>{record.description}</td>
				<td>{record.debit}</td>
				<td>{record.credit}</td>
			</tr>
		);
	}
}