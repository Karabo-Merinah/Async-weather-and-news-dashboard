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
function getCityCoordinates(city:string):Promise<{latitude:number,longitude:number}>{
    //validate the url by removing things like empty spaces 
 const WEATHER_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
 return fetchData(WEATHER_URL).then((data)=>{
    if(data.results && data.results.length>0){
        const {latitude,longitude}=data.results[0]
        return {latitude,longitude}
    }
    else{
        throw new Error( `${city} is not found`)
    }
 })
}

function getWeatherUrl(latitude:number,longitude:number):string{
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`
}
//pauses until weatherData is ready then prints weather  followed by the news also pauses unitl data is ready then print them .Catch errors for rejection
async function getWeatherAndNews(city:string): Promise<void> {
    try {
        const {latitude,longitude}=await getCityCoordinates(city)
        const WEATHER_URL=getWeatherUrl(latitude,longitude)
        const weatherData: Weather = await fetchData(WEATHER_URL)
        const weather = weatherData.current

        console.log("ASYNC AWAIT DASHBOARD")
        console.log("--- WEATHER DATA ----")
        console.log("\n")
        console.log(`Location: ${city}`)
        console.log(`Temperature: ${weather.temperature_2m}°C`)
        console.log(`Wind Speed: ${weather.wind_speed_10m}`)

        const newsData: News = await fetchData(NEWS_DUMMY_URL)
        const news = newsData.posts

        console.log("--- Daily news: ---")
        console.log("\n")
        console.log("--- News Headlines ---")
        for (let i = 0; i < news.length; i++) {
            const post = news[i]
            console.log(post?.title, post?.body)
        }
    } catch (error) {
        console.log("Error", error)
    }
}
//Both requests starts at the same time
async function getWeatherAndNewsTogether(city:string): Promise<void> {
    try {
        // wait until both are finished 
            const { latitude, longitude } = await getCityCoordinates(city)
    const WEATHER_URL = getWeatherUrl(latitude, longitude)
        const [weatherData,newsData] = await Promise.all([fetchData(WEATHER_URL), fetchData(NEWS_DUMMY_URL)])

        console.log("Weather and news together :")
        console.log("--- Weather infomration ----")
        console.log("\n")
        console.log(`Location: ${city}`)
        console.log(`Temperature: ${weatherData.current.temperature_2m}°C`)
        console.log(`First news headline:${newsData.posts[0].title}`)
    }
    catch (error) {
        console.log("Error", error)
    }
}
// Both request starts the same tme and race 
async function getFastestResponse(city:string): Promise<void> {
    try {
        //resolves the first results fetchData  
            const { latitude, longitude } = await getCityCoordinates(city)
    const WEATHER_URL = getWeatherUrl(latitude, longitude)
        const firstResults = await Promise.race([fetchData(WEATHER_URL), fetchData(NEWS_DUMMY_URL)])
        console.log("Race results")
        console.log("First response:", firstResults)
    } catch (error) {
        console.log("Error", error)
    }
}

//calling functions to run 
cityNameQuestion().then((city) => {
  getWeatherAndNews(city)
// getWeatherAndNewsTogether(city)
// getFastestResponse(city)
})