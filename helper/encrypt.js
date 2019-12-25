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
			const originalDoc = { ...doc };
			let untouchedInfo = {};
			if (originalDoc._id) untouchedInfo._id = originalDoc._id;
			if (originalDoc.createdAt) untouchedInfo.createdAt = originalDoc.createdAt;
			if (originalDoc.updatedAt) untouchedInfo.updatedAt = originalDoc.updatedAt;
			if (originalDoc.user) untouchedInfo.user = originalDoc.user;
			if (originalDoc.folder) untouchedInfo.folder = originalDoc.folder;
			if (originalDoc.type) untouchedInfo.type = originalDoc.type;
			delete originalDoc._id;
			delete originalDoc.createdAt;
			delete originalDoc.updatedAt;
			delete originalDoc.user;
			delete originalDoc.folder;
			delete originalDoc.type;
			delete originalDoc.__v;

			let encryptedDoc = { ...originalDoc };

			const docKeys = Object.keys(originalDoc);
			const promiseArr = docKeys.map(field => encrypt(originalDoc[field], secretKey) );
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
			const originalDoc = { ...doc };
			let untouchedInfo = {};
			if (originalDoc._id) untouchedInfo._id = originalDoc._id;
			if (originalDoc.createdAt) untouchedInfo.createdAt = originalDoc.createdAt;
			if (originalDoc.updatedAt) untouchedInfo.updatedAt = originalDoc.updatedAt;
			if (originalDoc.user) untouchedInfo.user = originalDoc.user;
			if (originalDoc.folder) untouchedInfo.folder = originalDoc.folder;
			if (originalDoc.type) untouchedInfo.type = originalDoc.type;
			delete originalDoc._id;
			delete originalDoc.createdAt;
			delete originalDoc.updatedAt;
			delete originalDoc.user;
			delete originalDoc.folder;
			delete originalDoc.type;
			delete originalDoc.__v;

			let decryptedDoc = { ...originalDoc };

			const docKeys = Object.keys(originalDoc);
			const promiseArr = docKeys.map(field => decrypt(originalDoc[field], secretKey) );
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


