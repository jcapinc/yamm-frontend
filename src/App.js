import React, { Component } from 'react';
import './App.css';
import Importer from './input/ImportTransactions.jsx';
import Login, {checkLogin} from './input/Login.jsx';
import Uncategorized from './output/Uncategorized.jsx';
import Categories from './output/Categories.jsx';
import Rules from './Rules.jsx';

class App extends Component {
  constructor(){
    super();
    checkLogin();
  }
  render() {
    if(window.localStorage.getItem('jwt')) return (
        <div className="App">
          <Importer />
          <br /><hr />
          <Uncategorized />
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
