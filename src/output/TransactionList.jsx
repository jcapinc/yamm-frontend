import React from 'react';

export default class TransactionList extends React.Component{
	constructor(props){
		super(props);
		this.state = {transactions: props.transactions};
	}
	render(){
		let rows = [];
	let i = 0;
	for(let record of this.state.data){
		if(++i % 30 === 0) rows.push(this.getHeader());
		rows.push(this.getTableRow(record));
	}
	return (
		<div className="transactions">
			<button onClick={this.getData.bind(this)}>Reload</button>
			<table border="1" width="100%">
				<thead>
					<tr key={this.headerCount++}>
						<th>Date</th>
						<th>Description</th>
						<th>Debit</th>
						<th>Credit</th>
					</tr>
				</thead>
				<tbody><TransactionRows transactions={this.state.transactions}/></tbody>
			</table>
		</div>);
	}
}

export class TransactionRows extends React.Component{
	constructor(props){
		super(props);
		this.state = {transactions:props.transactions};
	}

	render(){
		return this.state.transactions.map(this.renderRow);
	}

	renderRow(row,key){
		return (
			<tr key={key}>
				<td>{row.date}</td>
				<td>{row.description}</td>
				<td>{row.debit}</td>
				<td>{row.credit}</td>
			</tr>
		);
	}
}