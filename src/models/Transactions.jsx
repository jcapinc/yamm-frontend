import events from 'events';
import axios from "axios";
import config from '../../package.json';

const auth = `?authorization=${localStorage.jwt}`;
let TransactionData = [];

const Transactions = new events.EventEmitter();

Transactions.fetchTransactions = (function(){
	let url = `${config.config.backend}/v1/Transaction/Transactions${auth}`;
	return axios.get(url).then(response => {
		TransactionData = response.data;
		Transactions.emit('updated',TransactionData);
	}).then(this.getTransactions);
}).bind(Transactions);

Transactions.getTransactions = function(){
	return TransactionData;
};

Transactions.deleteTransaction = function(id){
	let url = `${config.config.backend}/v1/Transaction/Transaction${auth}&transaction=${id}`;
	return axios.delete(url).then(response => {
		Transactions.emit('deleted',id);
		return Transactions.fetchTransactions();
	})
}

export default Transactions;
Transactions.fetchTransactions();