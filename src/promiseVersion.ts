import https from "https"
import type { Weather, News } from "./types.js"

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=-26.2041&longitude=28.0473&current=temperature_2m,wind_speed_10m"

const NEWS_DUMMY_URL = "https://dummyjson.com/posts?limit=5"

//data is fetched using .get and if it arrives successfully convert it to JSON string then if there's an error just reject using that error 
function fetchData(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let body = ""
            response.on("data", (chunk) => {
                body += chunk
            })
            response.on("end", () => {
                resolve(JSON.parse(body))
            })
        }).on("error", (error) => {
            reject(error)
        })
    })
}
//After fetching data of weather then fetch for news data 
fetchData(WEATHER_URL).then((weatherData: Weather) => {
    const weather_data = weatherData.current
    console.log("--- PROMISE DASHBOARD - Weather & News ----")
    console.log("\n")
    console.log("--- Weather Data ---")
    console.log("\n")
    console.log(`Temperature:${weather_data.temperature_2m}°C`)
    console.log(`Wind speed:${weather_data.wind_speed_10m}`)
    console.log("\n")
    return fetchData(NEWS_DUMMY_URL)
}).then((newsData: News) => {
    const news = newsData.posts
    console.log("--- News Information ---")
    console.log("\n")
    console.log("--- News headline ---")
    for (let i = 0; i < news.length; i++) {
        const post = news[i]
        console.log(post?.title)
    }
    console.log("=== END OF THE PROMISE DASHBOARD ====")
}).catch((error) => {
    console.log("Error:", error.message)
})

// Promise.all: both requests start at the same time, wait for both
Promise.all([fetchData(WEATHER_URL), fetchData(NEWS_DUMMY_URL)]).then((results: any) => {
    console.log("Promise all results")
    console.log("\n")
    console.log("--- WEATHER INFORMATION ---")
    console.log("Temperature:", results[0].current.temperature_2m + "°C")
    console.log("Wind speed",results[0].current.wind_speed_10m)
    console.log("\n")
    console.log("--- News Information ---")
     console.log("\n")
     console.log("--- News headline ---")
    console.log("First news title:", results[1].posts[0].title)
   
}).catch((error) => {
    console.log("Error:", error.message)
})

// Promise.race: both start, but .then() runs with whichever finishes first.

Promise.race([fetchData(WEATHER_URL), fetchData(NEWS_DUMMY_URL)]).then((firstResults) => {
    console.log("\n")
    console.log("Promise race result")
    console.log("\n")
    //checks if weather is the first executed results 
    if(firstResults.current){
        console.log("--- Weather Data ---")
        console.log(`Temperature : ${firstResults.current.temperature_2m}° C`)
        console.log(`Wind speed: ${firstResults.current.wind_speed_10m}`)
    }
    else if(firstResults.posts){
        console.log('--- News Headlines ----')
         for (let i = 0; i < firstResults.posts.length; i++) {
        const post = firstResults.posts[i]
        console.log(post?.title)
    }
    }
    
}).catch((error) => {
    console.log("Error:", error.message)
})