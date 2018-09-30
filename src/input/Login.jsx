import React from 'react';
import Axios from 'axios';
import config from '../../package.json';

export default class Login extends React.Component{
	constructor(props){
		super(props);
		this.state = {jwt: null};
	}
	render(){
		if(this.state.jwt === null){
			return <LoginForm />
		}
		return <UserInfo />
	}
}

export class LoginForm extends React.Component{

	render(){
		return (
			<form onSubmit={this.attemptLoginFromForm}>
				<input type="text" name="username" /><br />
				<input type="password" name="password" /><br />
				<input type="submit" value="submit" />
			</form>
		)
	}

	attemptLoginFromForm(event){
		event.preventDefault();
		event.persist();
		console.log(event);
		let url = `${config.config.backend}/login`;
		url = `${url}?username=${event.target[0].value}&password=${event.target[1].value}`;
		return Axios.post(url).then( results =>{
			console.log("login results",results); 
			window.localStorage.setItem('jwt',results.data.token);
			this.forceUpdate();
		}).catch(error => {
			console.error("Login Error",error);
		});
	}

}

export class UserInfo extends React.Component{
	render(){
		return (<p>Current Logged In</p>)
	}
}