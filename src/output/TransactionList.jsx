import React from 'react';
import TransactionModel from '../models/Transactions.jsx';

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
		if(typeof this.props.transactions !== "array" && typeof this.props.transactions !== "object"){
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
			.filter(record => this.deleted.indexOf(record.id) == -1)
			.map(this.renderRow.bind(this));
	}

	renderRow(row,key){
		let moneyStyle = {
			textAlign:'right',
			fontFamily: 'Ubunto Mono,monospace,mono'
		};
		return (
			<tr key={key}>
				<td>{row.date}</td>
				<td>{row.description}</td>
				<td style={moneyStyle}>{row.debit.toFixed(2)}</td>
				<td style={moneyStyle}>{row.credit.toFixed(2)}</td>
				<td><button onClick={this.deleteTransaction.bind(this,row)}>Delete</button></td>
			</tr>
		);
	}

	deleteTransaction(row){
		TransactionModel.deleteTransaction(row.id);
		this.deleted.push(row.id);
	}
}