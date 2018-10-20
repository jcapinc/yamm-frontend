import React from 'react';
import axios from 'axios';
import config from '../../package.json';
let auth = `?authorization=${localStorage.jwt}`;

export default class Cashflow extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			transactions: [],
			rowConfig:{}
		};
	}
	render(){
		return (
			<div className="CashFlow">
				<h1>Cashflow</h1>
				<center>
					<table border="1">
						<thead>
							<tr>
								<th></th>
								<th colSpan="2">Previous Month</th>
								<th colSpan="2">Current Month</th>
							</tr>
							<tr>
								<th></th>
								<th>Credits</th>
								<th>Debits</th>
								<th>Credits</th>
								<th>Debits</th>
							</tr>
						</thead>
						<tbody>
							<CashflowTotal transactions={this.state.transactions} />
						</tbody>
					</table>
				</center>
			</div>
		);
	}

	getPeriod(offset){
		if(this.getPeriodType() === 'Month') 
			return this.getMonthPeriod(offset);
		return this.getWeekPeriod(offset);
	}

	getWeekPeriod(offset){
	}

	getMonthPeriod(offset){
		let start = new Date();
		start.setDate(0);
		start.setHours(0);
		start.setMinutes(0);
		start.setSeconds(0);
		let month = start.getMonth() + offset;
		start.setMonth(month);
		let end = new Date(start);
		end.setMonth(month + 1);
		return {start,end};
	}

	getPeriodType(){
		if(this.state.type) return this.state.type;
		return 'Month';
	}
	setPeriodType(type){
		this.setState({type:type});
	}
	handlePeriodTypeChange(event){
		return this.setPeriodType(event.target.value);
	}
}

export class CashflowRow extends React.Component{
	render(){
		return null;
	}
}

export class CashflowTotal extends React.Component{
	constructor(props){
		super(props);
		this.state = {transactions: props.transactions};
		this.beginningThisMonth = new Date();
		this.beginningThisMonth.setDate(0);
		this.beginningThisMonth.setHours(0);
		this.beginningThisMonth.setMinutes(0);
		this.beginningThisMonth.setSeconds(0);
		this.beginningNextMonth = new Date(this.beginningThisMonth);
		this.beginningNextMonth.setMonth(this.beginningNextMonth.getMonth() + 1);
		this.beginningPreviousMonth = new Date(this.beginningThisMonth);
		this.beginningPreviousMonth.setMonth(this.beginningPreviousMonth.getMonth() - 1);
		this.fetchTransactions();
	}
	render(){
		return (
			<tr>
				<td><b>Total</b></td>
				<td>${this.getTotal('credit',this.beginningPreviousMonth,this.beginningThisMonth).toFixed(2)}</td>
				<td>${this.getTotal('debit',this.beginningPreviousMonth,this.beginningThisMonth).toFixed(2)}</td>
				<td>${this.getTotal('credit',this.beginningThisMonth,this.beginningNextMonth).toFixed(2)}</td>
				<td>${this.getTotal('debit',this.beginningThisMonth,this.beginningNextMonth).toFixed(2)}</td>
			</tr>
		);
	}
	getTotal(type,start,end){
		if(!this.state.transactions || !this.state.transactions.length) return 0.0;
		return Object.values(this.state.transactions).filter(record => {
			let date = new Date(record.date);
			return date > start && date < end
		}).reduce((carry,record) => {
			return record[type] + carry;
		},0.0);
	}
	fetchTransactions(){
		let url = `${config.config.backend}/v1/Transaction/Transactions${auth}`;
		return axios.get(url).then(response => {
			this.setState({transactions: Object.values(response.data)});
		});
	}
}