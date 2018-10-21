import transactions from "../models/Transactions.jsx";
import React from "react";
import TransactionList from "./TransactionList.jsx";

const getWeekNumber = function(){
  var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

const DayHeader = [...Array(7).keys()].reverse().map(ct => {
	const day = new Date();
	day.setDate(day.getDate() - ct);
	return (<th key={ct}>{day.toLocaleString('en',{weekday: 'long'})}</th>);
});

const WeekHeader = [...Array(7).keys()].reverse().map(ct => {
	return (<th key={ct}>{getWeekNumber.call(new Date()) - ct}</th>);
});

const MonthHeader = [...Array(7).keys()].reverse().map(ct => {
	const day = new Date();
	day.setMonth(day.getMonth() - ct);
	return (<th key={ct}>{day.toLocaleString('en',{month: 'long'})}</th>);
});

export default class Dashboard extends React.Component{
	constructor(props){
		super(props);
		transactions.on("updated",event => {
			console.log(event);
			this.forceUpdate();
		});
	}
	render(){
		if(localStorage.showDashboard == 1){
			return this.renderDashboard();
		}
		return this.renderTeaser();
	}

	renderTeaser(){
		return (
			<div>
				<h3>Dashboard</h3>
				<center>
					<button onClick={this.show.bind(this)}>Show</button>
				</center>
			</div>
		)
	}

	renderDashboard(){
		return (
			<div>
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

class SpendingPerDay extends React.Component{
	constructor(props){
		super(props);
		this.state = {transactions: null};
		this.transactionRef = React.createRef();
	}

	render(){
		let transactions = null;
		if(this.state.transactions === null) transactions = (<span></span>);
		else if(this.state.transactions === []) transactions = (<i>No Transactions</i>);
		else transactions = (
			<span>
				<button onClick={this.setTransactions.bind(this,null)}>Clear</button>
				<TransactionList ref={this.transactionRef} transactions={this.state.transactions} />
			</span>
		);
		return (
			<center>
				<h3>Spending Per Day</h3>
				<table border="1" style={{fontFamily:'Ubuntu Mono,monospace,mono'}}>
					<thead><tr><th></th>{DayHeader}</tr></thead>
					<tbody>
						<tr>
							<td>Spending</td>
							{this.getSpendingByDay((carry,record) =>  carry + record.debit)}
						</tr>
						<tr>
							<td>Income</td>
							{this.getSpendingByDay((carry,record) =>  carry + record.credit)}
						</tr>
					</tbody>
				</table>
				
				{transactions}
			</center>
		);
	}

	getChartData(){
		return [...Array(7).keys()].reverse().map(ct => {
			const start = new Date();
			start.setDate(start.getDate() - ct - 1);
			const end = new Date();
			end.setDate(end.getDate() - ct);
			return transactions.getTransactions().filter(record => {
				const transactionDate = new Date(record.date);
				return transactionDate > start && transactionDate < end;
			}).reduce((carry,record) => {
				carry[0] += record.debits;
				carry[1] += record.credits;
				return carry;
			},[0,0]);
		});
	}

	getSpendingByDay(cb){
		return [...Array(7).keys()].reverse().map(ct => {
			const start = new Date();
			start.setDate(start.getDate() - ct - 1);
			const end = new Date();
			end.setDate(end.getDate() - ct);
			const transactionList = transactions.getTransactions().filter(record => {
				const transactionDate = new Date(record.date);
				return transactionDate > start && transactionDate < end;
			});
			const total = transactionList.reduce(cb,0);
			return (
				<td key={ct} onClick={this.setTransactions.bind(this,transactionList)} style={{textAlign:'right'}}>
					${total.toFixed(2)}
				</td>
			);
		});
	}

	setTransactions(transactions){
		this.setState({transactions: null});
		this.forceUpdate();
		this.setState({transactions: transactions});
	}
}

class SpendingPerWeek extends React.Component{
	constructor(props){
		super(props);
		this.state = {transactions: null};
	}

	render(){
		let transactions = null;
		if(this.state.transactions === null) transactions = (<span></span>);
		else if(this.state.transactions === []) transactions = (<i>No Transactions</i>);
		else transactions = (
			<span>
				<button onClick={this.setTransactions.bind(this,null)}>Clear</button>
				<TransactionList ref={this.transactionRef} transactions={this.state.transactions} />
			</span>
		);
		return (<center>
			<h3>Spending Per Week</h3>
			<table border="1" style={{fontFamily:'Ubuntu Mono,monospace,mono'}}>
				<thead><tr><td></td>{WeekHeader}</tr></thead>
				<tbody>
					<tr>
						<td>Spending</td>
						{this.getSpendingByWeek((total,record) => total += record.debit)}
					</tr>
					<tr>
						<td>Income</td>
						{this.getSpendingByWeek((total,record) => total += record.credit)}
					</tr>
				</tbody>
			</table>
			{transactions}
		</center>);
	}

	getSpendingByWeek(cb){
		return [...Array(7).keys()].reverse().map(ct => {
			const start = new Date();
			start.setDate(start.getDate() - start.getDay() - (ct * 7));
			const end = new Date(start);
			end.setDate(start.getDate() + 7);
			const trans = transactions.getTransactions().filter(record => {
				const transactionDate = new Date(record.date);
				return transactionDate > start && transactionDate < end;
			});
			const total = trans.reduce(cb,0);
			return (
				<td key={ct} onClick={this.setTransactions.bind(this,trans)} style={{textAlign:'right'}}>
					${total.toFixed(2)}
				</td>
			);
		});
	}

	setTransactions(transactions){
		this.setState({transactions:transactions});
	}
}

class SpendingPerMonth extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			transactions:null
		};
	}
	render(){
		let transactions = null;
		console.log("spending per month render",this.state.transactions);
		if(this.state.transactions === null) transactions = (<span></span>);
		else if(this.state.transactions === []) transactions = (<i>No Transactions</i>);
		else transactions = (
			<span>
				<button onClick={this.setTransactions.bind(this,null)}>Clear</button>
				<TransactionList ref={this.transactionRef} transactions={this.state.transactions} />
			</span>
		);
		return (
			<center>
				<h3>Spending Per Month</h3>
				<table border="1" style={{fontFamily:'Ubuntu Mono,monospace,mono'}}>
					<thead>
						<tr><td></td>{MonthHeader}</tr>
					</thead>
					<tbody>
						<tr>
							<td>Spending</td>
							{this.getSpendingByMonth((total,record) => total += record.debit)}
						</tr>
						<tr>
							<td>Income</td>
							{this.getSpendingByMonth((total,record) => total += record.credit)}
						</tr>
					</tbody>
				</table>
				{transactions}
			</center>
		);
	}

	getSpendingByMonth(cb){
		return [...Array(7).keys()].reverse().map(ct => {
			const start = new Date();
			start.setDate(1);
			start.setMonth(start.getMonth() - ct)
			const end = new Date(start);
			end.setMonth(start.getMonth() + 1);
			const trans = transactions.getTransactions().filter(record => {
				const transactionDate = new Date(record.date);
				return transactionDate > start && transactionDate < end;
			})
			const total = trans.reduce(cb,0);
			return (
				<td key={ct} onClick={this.setTransactions.bind(this,trans)} style={{textAlign:'right'}}>
					${total.toFixed(2)}
				</td>
			);
		});
	}

	setTransactions(transactions){
		this.setState({transactions: transactions});
	}
}
