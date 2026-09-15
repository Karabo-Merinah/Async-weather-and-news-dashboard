import https from "https"
import type  {Weather, News } from "./types.js"

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=-26.2041&longitude=28.0473&current=temperature_2m,wind_speed_10m"

const NEWS_DUMMY_URL = "https://dummyjson.com/posts?limit=5"


function fetchData(url:string):Promise<any>{
    return new Promise ((resolve,reject)=>{
        https.get(url,(response)=>{
            let body=""
            response.on("data",(chunk)=>{
                body+=chunk
            })
            response.on("end",()=>{
               resolve (JSON.parse(body))
            })
        }).on("error",(error)=>{
            reject(error)
        })
    })
}

fetchData(WEATHER_URL).then((weatherData:Weather)=>{
    const weather_data=weatherData.current
    console.log("PROMISE DASHBOARD")
    console.log(`Weather:${weather_data.temperature_2m}°C`)
    return fetchData(NEWS_DUMMY_URL)
}).then((newsData:News)=>{
    const news=newsData.posts
    console.log("News:")
    for(let i=0;i<news.length;i++){
        const post=news[i]
        console.log(post?.title)
    }
}).catch((error)=>{
    console.log("Error:",error.message)
})

// Promise.all: both requests start at the same time, wait for both
Promise.all([fetchData(WEATHER_URL),fetchData(NEWS_DUMMY_URL)]).then((results:any)=>{
    console.log("Promise all results")
    console.log("Weather:",results[0].current.temperature_2m+"°C")
    console.log("First new title:",results[1].posts[0].title)
}).catch((error)=>{
    console.log("Error:",error.message)
})

// Promise.race: both start, but .then() runs with whichever finishes first.

Promise.race([fetchData(WEATHER_URL),fetchData(NEWS_DUMMY_URL)]).then((firstResults)=>{
console.log("Promise race result")
console.log("First response:",firstResults)
}).catch((error)=>{
    console.log("Error:",error.message)
})