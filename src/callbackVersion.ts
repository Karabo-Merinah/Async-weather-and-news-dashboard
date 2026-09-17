import https from "https"
import type { Weather, News } from "./types.js"
import { cityNameQuestion } from "./cityQuestion.js"

const NEWS_DUMMY_URL = "https://dummyjson.com/posts?limit=5"


//Converts city name into coordinates using separate success/error callbacks
function getCityCoordinates(city:string,onSuccess:(latitude:number,lomgitude:number)=>void,onError:(error:Error)=>void){
    const GEOCODE_URL=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
    
    https.get(GEOCODE_URL,(response)=>{
        let body=""
        response.on("data",(chunk)=>{
            body+=chunk
        })
        response.on("end",()=>{
            try{
                const data=JSON.parse(body)
                if(data.results && data.results.length >0){
                    const latitude=data.results[0].latitude
                    const longitude=data.results[0].longitude
                    onSuccess(latitude,longitude)
                }
                else{
                    onError(new Error (`${city }is not found`))
                }
            }catch(error){
                onError(error as Error)
            }
        })
    }).on("error",(error)=>{
        onError(error)
    })
}

function getWeatherUrl(latitude: number, longitude: number): string {
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`
}

//Demonstrates the callback hell with nested functions
function getWeatherAndNews(city: string) {
    getCityCoordinates(city,(latitude,longitude) => {
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
                let weather_data: Weather
                try{
                    weather_data=JSON.parse(body)
                }
                catch(error){
                    console.log("Error parsing weather data ")
                    return
                }

                const weather=weather_data.current

                //fetching the news using the url 
                https.get(NEWS_DUMMY_URL, (response2) => {
                    let desc = ""
                    response2.on("data", (chunk) => {
                        desc += chunk
                    })
                    //desc is converted to string as it is chunks and parse it to json to retrieve only posts structure 
                    response2.on("end", () => {
                        let news_data: News
                        try{
                            news_data=JSON.parse(desc)
                        }
                        catch(error){
                            console.log("Error parsing weather data ")
                            return
                        }
                        const news = news_data.posts
                        //display the data in dashboard 
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
                            console.log(post?.title+"\n")
                        }
                    })
                }).on("error",(error)=>{
                console.log("News request failed:",error.message)
            })
        })
    }).on("error",(error) => {
        console.log("Weather request failed ", error.message )
    })
},(error)=>{
    console.log("Error",error.message)
}
)}

cityNameQuestion().then((city) => {
    getWeatherAndNews(city)
})
