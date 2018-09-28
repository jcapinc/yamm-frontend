import React, { Component } from 'react';
export default class ImportTransactions extends Component{
	render(){
		return (
			<div class="import-form">
				<input type="file" onChange={this.uploadFile} />
			</div>
		);
	}
	uploadFile(inputInfo){
		
	}
}