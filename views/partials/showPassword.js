function showPassword(elementId) { 
	
	let element = document.getElementById(elementId);
	let c = element.nextElementSibling; 

	if (element.getAttribute('type') == "password") { 
		c.removeAttribute("class"); 
		c.setAttribute("class","fas fa-eye"); 

		element.removeAttribute("type"); 
    element.setAttribute("type","text"); 
	} else { 
		element.removeAttribute("type"); 
		element.setAttribute('type','password'); 
		
		c.removeAttribute("class"); 
		c.setAttribute("class","fas fa-eye-slash"); 
	} 
}; 

module.exports = { showPassword };