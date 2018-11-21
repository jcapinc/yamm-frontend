import React from 'react';

export default class Rules extends React.Component{
	render(){
		return (
			<div>
				<h2>Rules for Category "{this.props.category.name}"</h2>
				
				<table style={{margin:"auto"}}>
					<thead>
						<tr>
							<th>Regular Expression</th>
							<th>Controls</th>
						</tr>
					</thead>
					<tbody>
						{this.listRules()}
					</tbody>
				</table>
			</div>
		);
	}

	listRules(){
		return this.props.category.category_rules.map(this.listRule.bind(this));
	}

	listRule(rule){
		return (
			<tr>
				<td>{rule.regex}</td>
				<td></td>
			</tr>
		);
	}
}