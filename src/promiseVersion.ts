import https from "https"
import type { Weather, News } from "./types.js"
import { cityNameQuestion } from "./cityQuestion.js"

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
                try {
                    resolve(JSON.parse(body))
                } catch (error) {
                    reject(error)
                }
            })
        })
    })
}

// Convert city name into coordinates
function getCityCoordinates(city: string): Promise<{ latitude: number, longitude: number }> {
        //validate the url by removing things like empty spaces 
    const WEATHER_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
    return fetchData(WEATHER_URL).then((data) => {
        if (data.results && data.results.length > 0) {
            const { latitude, longitude } = data.results[0]
            return { latitude, longitude }
        } else {
            throw new Error(`${city} is  not found`)
        }
    })
}

function getWeatherUrl(latitude: number, longitude: number): string {
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`
}

// Main Promise dashboard
function runPromiseDashboard(city: string) {
    getCityCoordinates(city).then(({ latitude, longitude }) => {
        const WEATHER_URL = getWeatherUrl(latitude, longitude)

        // Sequential: Weather → News
        fetchData(WEATHER_URL).then((weatherData: Weather) => {
            const weather = weatherData.current
            console.log("--- PROMISE DASHBOARD ---")
            console.log(`Location: ${city}`)
            console.log(`Temperature: ${weather.temperature_2m}°C`)
            console.log(`Wind speed: ${weather.wind_speed_10m}`)
            return fetchData(NEWS_DUMMY_URL)
        }).then((newsData: News) => {
            console.log("\n--- News Headlines ---")
            for (let i = 0; i < newsData.posts.length; i++) {
                const post = newsData.posts[i]
                console.log(post?.title, post?.body)
            }
            console.log("-----------------------------")
        }).catch((error) => {
            console.log("Error:", error.message)
        })
        // Promise.all: both requests start at the same time, wait for both
        Promise.all([fetchData(WEATHER_URL), fetchData(NEWS_DUMMY_URL)]).then((results: any) => {
            console.log("Promise all results")
            console.log("\n")
            console.log("--- WEATHER INFORMATION ---")
            console.log(`Location: ${city}`)
            console.log("Temperature:", results[0].current.temperature_2m + "°C")
            console.log("Wind speed", results[0].current.wind_speed_10m)
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
            if (firstResults.current) {
                console.log("--- Weather Data ---")
                console.log(`Location: ${city}`)
                console.log(`Temperature : ${firstResults.current.temperature_2m}° C`)
                console.log(`Wind speed: ${firstResults.current.wind_speed_10m}`)
            }
            else if (firstResults.posts) {
                console.log('--- News Headlines ----')
                for (let i = 0; i < firstResults.posts.length; i++) {
                    const post = firstResults.posts[i]
                    console.log(post?.title, post?.body)
                }
            }

        }).catch((error) => {
            console.log("Error:", error.message)
        })
    })
}
cityNameQuestion().then((city) => {
    runPromiseDashboard(city)
})
