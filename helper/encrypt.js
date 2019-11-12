// Nodejs encryption with CTR
const crypto = require('crypto');

const encrypt = async (text, key) => {
	const iv = crypto.randomBytes(16);
	let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
	let encrypted = cipher.update(text);
   
	encrypted = Buffer.concat([encrypted, cipher.final()]);
   
	return iv.toString('hex') + ':' + encrypted.toString('hex');
};
   
const decrypt = async (text, key) => {
	let textParts = text.split(':');
	let iv = Buffer.from(textParts.shift(), 'hex');
	let encryptedText = Buffer.from(textParts.join(':'), 'hex');
	let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
	let decrypted = decipher.update(encryptedText);

	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString();
};

// Document that is passed in should only be from the Vault collection
// Only string fields are valid
const encryptVault = async (doc, secretKey) => {
	try {
		let encryptedDoc = { ...doc };
		
		const docKeys = Object.keys(doc);
		const promiseArr = docKeys.map(field => encrypt(doc[field], secretKey) );
		const docEncryptedValues = await Promise.all(promiseArr.map(promise => promise.catch(error => console.log(error))));
		for (let i = 0; i < docKeys.length; i++) {
			encryptedDoc[docKeys[i]] = docEncryptedValues[i];
		}
		return encryptedDoc;
	} catch (error) {
		console.error('Error in encrypting document', error);
		return null;
	}
};

const decryptVault = async (doc, secretKey) => {
	try {
		let decryptedDoc = { ...doc };
		
		const docKeys = Object.keys(doc);
		const promiseArr = docKeys.map(field => decrypt(doc[field], secretKey) );
		const docDecryptedValues = await Promise.all(promiseArr.map(promise => promise.catch(error => console.log(error))));
		for (let i = 0; i < docKeys.length; i++) {
			decryptedDoc[docKeys[i]] = docDecryptedValues[i];
		}
		return decryptedDoc;
	} catch (error) {
		console.error('Error in encrypting document', error);
		return null;
	}
};

module.exports = {
	encrypt,
	decrypt,
	encryptVault,
	decryptVault,
};


