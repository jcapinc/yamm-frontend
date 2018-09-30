import React, { Component } from 'react';
import './App.css';
import Importer from './input/ImportTransactions.jsx';
import Login from './input/Login.jsx';
import Uncategorized from './output/Uncategorized.jsx';
import Categories from './output/Categories.jsx';

class App extends Component {
  render() {
    if(window.localStorage.getItem('jwt')) return (
        <div className="App">
          <Importer />
          <br /><hr />
          <Uncategorized />
          <br /><hr />
          <Categories />
        </div>
      );
    else return ( <Login /> );
  }
}

export default App;
