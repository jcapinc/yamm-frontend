import events from 'events';
import axios from "axios";
import config from '../../package.json';

let auth = `?authorization=${localStorage.jwt}`;
let TransactionData = [];

const Transactions = new events.EventEmitter();

Transactions.fetchTransactions = function(){
	let url = `${config.config.backend}/v1/Transaction/Transactions${auth}`;
	return axios.get(url).then(response => {
		TransactionData = response.data;
		console.log(Transactions.emit('updated',TransactionData));
	}).then(this.getTransactions);
};

Transactions.getTransactions = function(){
	return TransactionData;
};

export default Transactions;
Transactions.fetchTransactions();