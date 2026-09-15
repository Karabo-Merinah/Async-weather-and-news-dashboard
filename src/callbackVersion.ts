import https from "https"
import type { Weather,News } from "./types.js"


const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=-26.2041&longitude=28.0473&current=temperature_2m,wind_speed_10m"

const NEWS_DUMMY_URL = "https://dummyjson.com/posts?limit=5"

//Fetching the weather 
// starts the request
https.get(WEATHER_URL, (response) => {
    //response is recieved in form of chunks  which is binary so we convert it to string 
    let body = ""
    response.on("data", (chunk) => {
        body += chunk
    })
    response.on("end", () => {
        //body holds the full string and parse it then grab current  from weather structure
        const weather_data:Weather=JSON.parse(body)
        const weather= weather_data.current

        
        //fetching the news using the url 
        https.get(NEWS_DUMMY_URL, (response2) => {
            let desc = ""
            response2.on("data", (chunk) => {
                desc += chunk
            })
            //desc is converted to string as it is chunks and parse it to json to retrieve only posts structure 
            response2.on("end", () => {
                const news_data:News=JSON.parse(desc)
                const news = news_data.posts
                console.log("=====News and Weather Dashboard =====")
                console.log(`Weather: ${weather.temperature_2m}°C`)
                console.log("News:")
                for(let i=0;i<news.length;i++){
                    const post=news[i]
                    console.log(post?.title)
                }
            })
        })
    })

})
