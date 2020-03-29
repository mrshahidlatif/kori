export default (func, wait=250) =>{
	let timeout;
	const debounce = function(...args){

		const later = ()=>{
			timeout = null;
			func(...args);
		};
		
		let callNow = !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func(...args);

	};

	debounce.cancel = ()=>{
		clearTimeout(timeout);
		timeout = null;
	};
	return debounce;
};