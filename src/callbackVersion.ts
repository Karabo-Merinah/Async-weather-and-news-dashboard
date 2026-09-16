import https from "https"
import type { Weather, News } from "./types.js"
import { cityNameQuestion } from "./cityQuestion.js"

const NEWS_DUMMY_URL = "https://dummyjson.com/posts?limit=5"


function fetchData(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let body = ""
            response.on("data", (chunk) => {
                body += chunk
            })
            response.on("end", () => {
                try {
                    resolve(JSON.parse(body))
                } catch (error) {
                    reject(error)
                }
            })
    })
})
}
//Converts city name into coordinates 
function getCityCoordinates(city: string): Promise<{ latitude: number, longitude: number }> {
        //validate the url by removing things like empty spaces 
    const WEATHER_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
    return fetchData(WEATHER_URL).then((data) => {
        if (data.results && data.results.length > 0) {
            const { latitude, longitude } = data.results[0]
            return { latitude, longitude }
        }
        else {
            throw new Error(`${city} is not found`)
        }
    })
}

function getWeatherUrl(latitude: number, longitude: number): string {
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`
}
function getWeatherAndNews(city: string) {
    getCityCoordinates(city).then(({ latitude, longitude }) => {
        const  WEATHER_URL = getWeatherUrl(latitude, longitude)
        //Fetching the weather 
        // starts the request
        https.get( WEATHER_URL, (response) => {
            //response is recieved in form of chunks  which is binary so we convert it to string 
            let body = ""
            response.on("data", (chunk) => {
                body += chunk
            })
            response.on("end", () => {
                //body holds the full string and parse it then grab current  from weather structure
                const weather_data: Weather = JSON.parse(body)
                const weather = weather_data.current
                //fetching the news using the url 
                https.get(NEWS_DUMMY_URL, (response2) => {
                    let desc = ""
                    response2.on("data", (chunk) => {
                        desc += chunk
                    })
                    //desc is converted to string as it is chunks and parse it to json to retrieve only posts structure 
                    response2.on("end", () => {
                        const news_data: News = JSON.parse(desc)
                        const news = news_data.posts
                        console.log("----News and Weather Dashboard ----")
                        console.log("\n")
                        console.log("--- Weather Data ---")
                        console.log(`Location: ${city}`)
                        console.log(`Temperature: ${weather.temperature_2m}°C`)
                        console.log(`Wind speed: ${weather.wind_speed_10m}`)
                        console.log("--- News Information: --- ")
                        console.log("\n")
                        console.log("---News headline---")
                        for (let i = 0; i < news.length; i++) {
                            const post = news[i]
                            console.log(post?.title, post?.body)
                        }
                    })
                })
            })
        })
    }).catch((error) => {
        console.log("Error:", error.message )
    })
}
cityNameQuestion().then((city) => {
    getWeatherAndNews(city)
})
