import https from "https"
import type { Weather, News } from "./types.js"

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=-26.2041&longitude=28.0473&current=temperature_2m,wind_speed_10m"

const NEWS_DUMMY_URL = "https://dummyjson.com/posts?limit=5"

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
        })
            .on("error", (error) => {
                reject(error)
            })
    })
}
//pauses until weatherData is ready then prints weather  followed by the news also pauses unitl data is ready then print them .Catch errors for rejection
async function getWeatherAndNews(): Promise<void> {
    try {
        const weatherData: Weather = await fetchData(WEATHER_URL)
        const weather = weatherData.current

        console.log("ASYNC AWAIT DASHBOARD")
        console.log("--- WEATHER DATA ----")
        console.log("\n")
        console.log(`Temperature: ${weather.temperature_2m}°C`)
        console.log(`Wind Speed: ${weather.wind_speed_10m}`)

        const newsData: News = await fetchData(NEWS_DUMMY_URL)
        const news = newsData.posts

        console.log("--- Daily news: ---")
        console.log("\n")
        console.log("--- News Headlines ---")
        for (let i = 0; i < news.length; i++) {
            const post = news[i]
            console.log(post?.title)
        }
    } catch (error) {
        console.log("Error", error)
    }
}
//Both requests starts at the same time
async function getWeatherAndNewsTogether(): Promise<void> {
    try {
        // wait until both are finished 
        const results = await Promise.all([fetchData(WEATHER_URL), fetchData(NEWS_DUMMY_URL)])

        console.log("Weather and news together :")
        console.log("--- Weather infomration ----")
        console.log("\n")
        console.log("Temperature", results[0].current.temperature_2m + "°C")
        console.log("First news headline", results[1].posts[0].title)
    }
    catch (error) {
        console.log("Error", error)
    }
}
// Both request starts the same tme and race 
async function getFastestResponse(): Promise<void> {
    try {
        //resolves the first results fetchData  
        const firstResults = await Promise.race([fetchData(WEATHER_URL), fetchData(NEWS_DUMMY_URL)])

        console.log("Race results")
        console.log("First response:", firstResults)
    } catch (error) {
        console.log("Error", error)
    }
}

//calling functions to run 
getWeatherAndNews()
// getWeatherAndNewsTogether()
// getFastestResponse()