// Nodejs encryption with CTR
const crypto = require('crypto');

// Will only encrypt single string value
const encrypt = (text, key) => {
	return new Promise((resolve, reject) => {
		try {
			const iv = crypto.randomBytes(16);
			let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
			let encrypted = cipher.update(text);
		
			encrypted = Buffer.concat([encrypted, cipher.final()]);
		
			resolve(iv.toString('hex') + ':' + encrypted.toString('hex'));
		} catch (error) {
			reject(error);
		}
	});
};

// Will only decrypt single string value
const decrypt = (text, key) => {
	return new Promise((resolve, reject) => {
		try {
			let textParts = text.split(':');
			const iv = Buffer.from(textParts[0], 'hex');
			let encryptedText = Buffer.from(textParts[1], 'hex');
			let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
			let decrypted = decipher.update(encryptedText);
		
			decrypted = Buffer.concat([decrypted, decipher.final()]);
		
			resolve(decrypted.toString());	
		} catch (error) {
			reject(error);
		}
	});
};

// Only regular string fields will be encrypted/decrypted
// functions will ignore fields that should not be affected
const encryptVault = (doc, secretKey) => {
	return new Promise(async (resolve, reject) => {
		try {
			let untouchedInfo = {};
			if (doc._id) untouchedInfo._id = doc._id;
			if (doc.createdAt) untouchedInfo.createdAt = doc.createdAt;
			if (doc.updatedAt) untouchedInfo.updatedAt = doc.updatedAt;
			if (doc.user) untouchedInfo.user = doc.user;
			if (doc.folder) untouchedInfo.folder = doc.folder;
			if (doc.type) untouchedInfo.type = doc.type;
			delete doc._id;
			delete doc.createdAt;
			delete doc.updatedAt;
			delete doc.user;
			delete doc.folder;
			delete doc.type;
			delete doc.__v;

			let encryptedDoc = { ...doc };

			const docKeys = Object.keys(doc);
			const promiseArr = docKeys.map(field => encrypt(doc[field], secretKey) );
			const docEncryptedValues = await Promise.all(promiseArr.map(promise => promise.catch(error => console.log(error))));
			for (let i = 0; i < docKeys.length; i++) {
				encryptedDoc[docKeys[i]] = docEncryptedValues[i];
			}
			resolve({ ...encryptedDoc, ...untouchedInfo });
		} catch (error) {
			console.error('Error in encrypting document', error);
			reject(null);
		}
	});
};

const decryptVault = (doc, secretKey) => {
	return new Promise(async (resolve, reject) => {
		try {
			let untouchedInfo = {};
			if (doc._id) untouchedInfo._id = doc._id;
			if (doc.createdAt) untouchedInfo.createdAt = doc.createdAt;
			if (doc.updatedAt) untouchedInfo.updatedAt = doc.updatedAt;
			if (doc.user) untouchedInfo.user = doc.user;
			if (doc.folder) untouchedInfo.folder = doc.folder;
			if (doc.type) untouchedInfo.type = doc.type;
			delete doc._id;
			delete doc.createdAt;
			delete doc.updatedAt;
			delete doc.user;
			delete doc.folder;
			delete doc.type;
			delete doc.__v;

			let decryptedDoc = { ...doc };

			const docKeys = Object.keys(doc);
			const promiseArr = docKeys.map(field => decrypt(doc[field], secretKey) );
			const docDecryptedValues = await Promise.all(promiseArr.map(promise => promise.catch(error => console.log(error))));
			for (let i = 0; i < docKeys.length; i++) {
				decryptedDoc[docKeys[i]] = docDecryptedValues[i];
			}
			resolve({ ...decryptedDoc, ...untouchedInfo });
		} catch (error) {
			console.error('Error in decrypting document', error);
			reject(null);
		}
	});
};

module.exports = {
	encrypt,
	decrypt,
	encryptVault,
	decryptVault,
};


