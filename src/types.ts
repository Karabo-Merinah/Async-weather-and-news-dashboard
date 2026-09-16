export interface Weather{
    current:{
        time:string,
        temperature_2m:number,
        wind_speed_10m:number
    }
}
export interface Post{
    title:string,
    body:string,
    tags:string[]
}
export interface News{
    posts:Post[]
}