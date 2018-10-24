import React from 'react';
import TransactionModel from '../models/Transactions.jsx';
import CategoryModel from '../models/Categories.jsx';

export default class TransactionList extends React.Component{
	render(){
		return (
			<center className="transactions">
				<table border="1">
					<thead>
						<tr key={this.headerCount++}>
							<th>Date</th>
							<th>Description</th>
							<th>Debit</th>
							<th>Credit</th>
							<th>Category</th>
							<th></th>
						</tr>
					</thead>
					<tbody><TransactionRows transactions={this.props.transactions}/></tbody>
				</table>
			</center>
		);
	}
}

export class TransactionRows extends React.Component{
	constructor(props){
		super(props);
		this.deleted = [];
	}
	render(){
		console.log("Rendering Transaction Rows",typeof this.props.transactions,this.props.transactions);
		if(typeof this.props.transactions !== "object"){
			return (
				<tr>
					<td colSpan="4">
						<center><i>Could not render, transactions were not passed in as an array</i></center>
					</td>
				</tr>
			);
		}
		console.log(this.deleted)
		return this.props.transactions
			.filter(record => this.deleted.indexOf(record.id) === -1)
			.map(this.renderRow.bind(this));
	}

	renderRow(row){
		let moneyStyle = {
			textAlign:'right',
			fontFamily: 'Ubunto Mono,monospace,mono'
		};
		return (
			<tr key={row.id}>
				<td>{row.date}</td>
				<td>{row.description}</td>
				<td style={moneyStyle}>{row.debit.toFixed(2)}</td>
				<td style={moneyStyle}>{row.credit.toFixed(2)}</td>
				<td>
					<select onChange={this.categorize.bind(this,row.id)}>
						{this.getCategoryOptions(row.categories)}
					</select>
				</td>
				<td><button onClick={this.deleteTransaction.bind(this,row)}>Delete</button></td>
			</tr>
		);
	}

	categorize(transaction,event){
		return CategoryModel.categorizeTransaction(event.target.value,transaction)
			.then(TransactionModel.fetchTransactions);
	}

	getCategoryOptions(categories){
		if(!categories) categories = [];
		const opts = CategoryModel.getCategories().sort((cat1,cat2) => ('' + cat1.name).localeCompare(cat2.name)).map(cat => {
			const props = {value:cat.id};
			if( categories.map(record => record.id).indexOf(cat.id) !== -1)
				props.selected = "selected";
			return (<option {...props}>{cat.name}</option>);
		});
		opts.unshift((<option value={null}>- Uncategorized -</option>));
		return opts;
	}

	deleteTransaction(row,event){
		if(event.target.innerHTML === "Delete"){
			return event.target.innerHTML = "Confirm Delete?";
		}
		TransactionModel.deleteTransaction(row.id);
		this.deleted.push(row.id);
	}
}