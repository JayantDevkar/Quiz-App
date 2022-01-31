var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://cat-fact.herokuapp.com/facts',
};

async function get_questions(){
    let resp = await axios.request(options)
    let data = await JSON.stringify(resp.data[0])
    console.log(data)
    return data
    return new Promise((resolve,reject)=>{
        axios.request(options).then(function (response) {
            console.log("data bolte",response.data);
            resolve(JSON.stringify(response.data))
        }).catch(function (error) {
            resolve(false)
            console.error(error);
        });
    })
}

get_questions()

module.exports={
get_questions
}