import React, { Component } from 'react';
import axios from 'axios';
import pack from '../../package.json';
import TransactionModel from "../models/Transactions.jsx";

export default class ImportTransactions extends Component{
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
		let url = this.chooseEndpoint(inputInfo);
		axios.post(url,data).then( () => {
			TransactionModel.fetchTransactions();
		});
	}

	chooseEndpoint(inputInfo){
		if(this.uploadInput.files[0].name.split(".").slice(-1).pop().toLowerCase() === "iif")
			return `${pack.config.backend}/v1/Import/ImportIIF?authorization=${localStorage.jwt}`;	
		return `${pack.config.backend}/v1/Import/ImportFile?authorization=${localStorage.jwt}`;
	}
}