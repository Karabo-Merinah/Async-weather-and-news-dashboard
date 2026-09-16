import readline from "readline"

export function cityNameQuestion():Promise<String>{
return new Promise ((resolve)=>{
    //listens for user input 
    const userInput=readline.createInterface({
        input:process.stdin
    })
    //user's questions
    userInput.question("Please enter the name of city to search for.",(city)=>{
        resolve(city)
        userInput.close()
    })
})
}


