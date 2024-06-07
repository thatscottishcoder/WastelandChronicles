    document.onload() = weather();
    
    async function weather(){
        const response = await fetch("http://fb24.decoded.com:8000/weatherforecast");
        const data = await response.json();
        console.log(data);

        const weatherlist = document.getElementById("weather");
        for(const d of data) {
            weatherlist.innerHTML += `<li>On ${d.date}, the weather forecast is ${d.summary} with a temperature of ${d.temperatureC}&deg;C.</li>`
        }
    }


