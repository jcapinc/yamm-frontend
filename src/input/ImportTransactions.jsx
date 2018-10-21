import React, { Component } from 'react';
import axios from 'axios';
import pack from '../../package.json';
import TransactionModel from "../models/Transactions.jsx";

export default class ImportTransactions extends Component{
	constructor(props){
		super(props);
	}
	render(){
		return (
			<div className="import-form">
				<h1>Import Transactions</h1>
				<input type="file" name="transactions" ref={(ref) => { this.uploadInput = ref; }} />
				<button onClick={this.uploadFile.bind(this)}>Upload</button>
			</div>
		);
	}

	uploadFile(inputInfo){
		const data = new FormData();
		data.append('transactions',this.uploadInput.files[0]);
		let url = `${pack.config.backend}/v1/Import/ImportFile?authorization=${localStorage.jwt}`;
		axios.post(url,data).then(result => {
			TransactionModel.fetchTransactions();
		});
	}
}