import React from "react";
import transactions from "../models/Transactions.jsx";
import TransactionList from "./TransactionList.jsx";

const getWeekNumber = function(){
  var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

const getTotalAndAverageHeaders = function(){
	return [(<th>Average</th>),(<th>Total</th>)];
}

export default class Cashflow extends React.Component{
	constructor(props){
		super(props);
		transactions.on("updated",event => {
			this.forceUpdate();
		});
	}
	render(){
		if(parseInt(localStorage.showDashboard,10) === 1){
			return this.renderDashboard();
		}
		return this.renderTeaser();
	}

	renderTeaser(){
		return (
			<div>
				<h3>Cashflow</h3>
				<center>
					<button onClick={this.show.bind(this)}>Show</button>
				</center>
			</div>
		)
	}

	renderDashboard(){
		return (
			<div class="dashboard">
				<h1>Dashboard</h1>
				<center>
					<button onClick={this.reload.bind(this)}>Reload</button>
					<button onClick={this.hide.bind(this)}>Hide</button>
				</center>
				<SpendingPerDay />
				<SpendingPerWeek />
				<SpendingPerMonth />
			</div>
		);
	}

	hide(){
		localStorage.setItem("showDashboard",0);
		this.forceUpdate();
	}

	show(){
		localStorage.setItem("showDashboard",1);
		this.forceUpdate();
	}

	reload(){
		return transactions.fetchTransactions();
	}
}

class SpendingPerPeriod extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			transactions: null,
			periodOffset: 0
		};
		this.columnCount = 7;
		this.financialStyle = {textAlign:'right',fontFamily:'Ubuntu Mono,monospace,mono'};
	}

	render(){
		let transactions = null;
		if(this.state.transactions === null) transactions = (<span></span>);
		else if(this.state.transactions === []) transactions = (<i>No Transactions</i>);
		else transactions = (
			<span>
				<button onClick={this.setTransactions.bind(this,null)}>Clear</button>
				<TransactionList transactions={this.state.transactions} />
			</span>
		);
		return (
			<center>
				<h3>
					<button onClick={this.incrementPeriodOffset(1)}>&lt;</button>&nbsp;
					Spending Per {this.periodName}&nbsp;
					<button onClick={this.incrementPeriodOffset(-1)}>&gt;</button>
				</h3>
				<table border="1" style={{fontFamily:'Ubuntu Mono,monospace,mono'}}>
					<thead><tr><th></th>{this.getHeader()}</tr></thead>
					<tbody>
						<tr>
							<td>Spending</td>
							{this.getSpendingByPeriod((carry,record) =>  carry + record.debit)}
						</tr>
						{this.getCategoryRows()}
						{this.getUncategorizedRows()}
						<tr>
							<td>Income</td>
							{this.getSpendingByPeriod((carry,record) =>  carry + record.credit)}
						</tr>
					</tbody>
				</table>
				{transactions}
			</center>
		);
	}

	incrementPeriodOffset(offset){
		return () => {
			let periodOffset = this.state.periodOffset;
			periodOffset += offset;
			this.setState({periodOffset});
		};
	}

	getCategoryRows(){
		return Object.values(transactions.getTransactions().reduce((carry, record) => {
			record.categories.map(record => carry[record.name] = record);
			return carry;
		},{})).sort((cat1,cat2) => ('' + cat1.name).localeCompare(cat2.name)).map(this.getCategoryRow.bind(this));
	}

	getCategoryRow(category){
		const txs = transactions.getTransactions().filter(record => {
			return record.categories.map(rec => rec.id).indexOf(category.id) !== -1;
		});
		const cells = this.columnLoop(ct => this.getSpendingByPeriodForTransactions(ct,txs,(carry,record) => {
			return carry - record.debit + record.credit
		}));
		return (
			<tr>
				<td>{category.name}</td>
				{[...cells,...this.getTotalAndAverageCells(txs)]}
			</tr>
		);
	}

	getUncategorizedRows(){
		return (
			<tr>
				<td>Uncategorized</td>
				{this.getUncategorizedRow((total,record) => total + record.debit)}
			</tr>
		)
	}

	getUncategorizedRow(reductionCb){
		const txs = transactions.getTransactions() ? 
			transactions.getTransactions().filter(record => record.categories.length === 0) : [];
		return [...this.columnLoop(ct => this.getSpendingByPeriodForTransactions(ct,txs,reductionCb)),
			this.getTotalAndAverageCells(txs)];
	}

	getSpendingByPeriod(cb){
		const transactionLists = [...Array(7).keys()].reverse().map(ct => {
			const period = this.getPeriod(ct + this.state.periodOffset);
			const transactionList = this.filterTransactionsByPeriod(period);
			return transactionList
		});
		return [...transactionLists.map( (list,ct) => {
			return (
				<td key={ct} onClick={this.setTransactions.bind(this,list)} style={{textAlign:'right'}}>
					${list.reduce(cb,0).toFixed(2)}
				</td>
			);
		}),...this.getTotalAndAverageCells(transactionLists.reduce((carry,list) => carry.concat(list),[]))];
	}

	filterTransactionsByPeriod(period,trxs){
		return (trxs ? trxs : transactions.getTransactions()).filter(record => {
			const transactionDate = new Date(record.date);
			return transactionDate > period.start && transactionDate < period.end;
		});
	}

	columnLoop(columnCb){
		return [...Array(this.columnCount).keys()].reverse().map(ct => columnCb(ct));
	}

	getSpendingByPeriodForTransactions(ct,transactions,reductionCb){
		const period = this.getPeriod(ct + this.state.periodOffset);
		const transactionList = this.filterTransactionsByPeriod(period,transactions);
		const total = transactionList.reduce(reductionCb,0);
		const key = ct.toString() + "_" + (new Date()).toString()
		return (
			<td key={key} onClick={this.setTransactions.bind(this,transactionList)} style={this.financialStyle}>
				${total.toFixed(2)}
			</td>
		);
	}

	getTotalAndAverageCells(txs){
		const total = this.columnLoop(ct => {
			return this.filterTransactionsByPeriod(this.getPeriod(ct + this.state.periodOffset),txs)
				.reduce((carry,record) => parseFloat(carry) + parseFloat(record.credit) - parseFloat(record.debit),0);
		}).reduce((carry, amount) => amount + carry,0).toFixed(2);
		return [
			(<td style={this.financialStyle}>${(total ? total / this.columnCount : 0).toFixed(2)}</td>),
			(<td style={this.financialStyle}>${total}</td>)
		];
	}

	getTotalForAllPeriodsForTransactions(transactions,reductionCb){
		let period = this.getWholePeriod();
		const transactionList = transactions.filter(record => {
			const transactionDate = new Date(record.date);
			return transactionDate > period.start && transactionDate < period.end;
		});
		return transactionList.reduce(reductionCb,0);
	}

	getWholePeriod(){
		const endPeriod = this.getPeriod(this.state.periodOffset);
		const startPeriod = this.getPeriod(this.columnCount - 1 + this.state.periodOffset)
		return {start: startPeriod.start,end: endPeriod.end};
	}

	setTransactions(transactions){
		this.setState({transactions: transactions});
	}
}

class SpendingPerDay extends SpendingPerPeriod{
	constructor(props){
		super(props);
		this.periodName = "Day";
	}

	getHeader(){
		return [...[...Array(7).keys()].reverse().map(ct => {
			const day = new Date();
			day.setDate(day.getDate() - ct - this.state.periodOffset);
			return (
				<th key={ct}>
					{day.toLocaleString('en',{weekday: 'long'})}<br />
					<small>{day.getMonth() + 1}/{day.getDate()}</small>
				</th>
			);
		}),...getTotalAndAverageHeaders()];
	}

	getPeriod(ct){
		const period = {};
		period.start = new Date();
		period.start.setDate(period.start.getDate() - ct - 1);
		period.end = new Date();
		period.end.setDate(period.end.getDate() - ct);
		return period;
	}
}

class SpendingPerWeek extends SpendingPerPeriod{
	constructor(props){
		super(props);
		this.periodName = "Week";
	}

	getHeader(){
		return [...[...Array(7).keys()].reverse().map(ct => {
			return (<th key={ct}>{getWeekNumber.call(new Date()) - ct - this.state.periodOffset}</th>);
		}),...getTotalAndAverageHeaders()];
	}

	getPeriod(ct){
		const period = {};
		period.start = new Date();
		period.start.setDate(period.start.getDate() - period.start.getDay() - (ct * 7));
		period.end = new Date(period.start);
		period.end.setDate(period.start.getDate() + 7);
		return period;
	}
}

class SpendingPerMonth extends SpendingPerPeriod{
	constructor(props){
		super(props);
		this.periodName = "Month";
	}

	getHeader(){
		return [...[...Array(7).keys()].reverse().map(ct => {
			const day = new Date();
			day.setMonth(day.getMonth() - ct - this.state.periodOffset);
			return (<th key={ct}>{day.toLocaleString('en',{month: 'long'})}</th>);
		}),...getTotalAndAverageHeaders()];
	}

	getPeriod(ct){
		const period = {};
		period.start = new Date();
		period.start.setDate(1);
		period.start.setMonth(period.start.getMonth() - ct)
		period.end = new Date(period.start);
		period.end.setMonth(period.start.getMonth() + 1);
		return period;
	}
	
}
