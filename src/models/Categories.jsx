import events from 'events';
import axios from 'axios';
import config from '../../package.json';

const auth = `?authorization=${localStorage.jwt}`;

let CategoryData = [];

const Categories = new events.EventEmitter();

Categories.getCategories = function(){
	return CategoryData;
}

Categories.fetchCategories = function(){
	let url = `${config.config.backend}/v1/Categorization/Categories${auth}`;
	return axios.get(url).then( result => {
		CategoryData = result.data;
		Categories.emit('updated',CategoryData);
		return CategoryData;
	}).catch( error => {
		console.error(error);
	});
};

Categories.fetchCategories();

Categories.categorizeTransaction = function(categoryId,transactionId){
	let url = `${config.config.backend}/v1/Categorization/CategorizeSingle${auth}` + 
		`&category=${categoryId}&transaction=${transactionId}`;
	return axios.put(url);
};


export default Categories;