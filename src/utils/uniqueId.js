import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
export default (prefix) => { 
	return (prefix ? prefix + nanoid() : nanoid());
};