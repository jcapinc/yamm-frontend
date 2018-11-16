import React, { Component } from 'react';
import './App.css';
import Importer from './input/ImportTransactions.jsx';
import Login, {checkLogin} from './input/Login.jsx';
import Categories from './output/Categories.jsx';
import Rules from './input/Rules.jsx';
import Cashflow from'./output/Cashflow.jsx';

class App extends Component {
  constructor(){
    super();
    checkLogin();
  }
  render() {
    if(window.localStorage.getItem('jwt')) return (
        <div className="App">
          <Cashflow />
          <br /><hr />
          <Importer />
          <br /><hr />
          <Categories />
          <br /><hr />
          <Rules />
        </div>
      );
    else return ( <Login /> );
  }
}

export default App;
