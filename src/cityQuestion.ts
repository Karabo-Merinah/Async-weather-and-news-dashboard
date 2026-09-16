import readline from "readline"

export function cityNameQuestion():Promise<string>{
return new Promise ((resolve)=>{
    //listens for user input 
    const userInput=readline.createInterface({
        input:process.stdin,
        output:process.stdout
    })
    //user's questions
    userInput.question("Please enter the name of city you want to search for ",(city)=>{
        resolve(city)
        userInput.close()
    })
})
}


