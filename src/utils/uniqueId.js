import shortid from 'shortid';
export default (prefix) => { 
	return (prefix ? prefix + shortid.generate() : shortid.generate());

};