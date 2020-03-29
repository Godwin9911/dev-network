
if(localStorage.getItem('connections') === null){
    let list= ['test@email.com', 'example@email.com']
    localStorage.setItem('connections', JSON.stringify(list))
}
let retrievedData = localStorage.getItem('connections');
let convertedList = JSON.parse(retrievedData);

console.log(convertedList);

convertedList.forEach(el => {
    let id = document.getElementById(`#${el}`);
    id.classList.add('yes');
    console.log(el);
});


//handle connect
function connect(email, checked){
    console.log(email)
    if(checked === false){
        convertedList.splice(email, 1)
        localStorage.setItem('connections', JSON.stringify(convertedList));
        console.log(convertedList)
    }else{
        convertedList.push(email);
        localStorage.setItem('connections', JSON.stringify(convertedList));
        console.log(convertedList)
    }
}