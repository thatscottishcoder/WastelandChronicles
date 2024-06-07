using System.Data.SQLite;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(policyBuilder => policyBuilder.AddDefaultPolicy(policy => policy.WithOrigins("*").AllowAnyHeader().AllowAnyHeader()) );

var app = builder.Build();
app.UseHttpsRedirection();
app.UseCors();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

string connectionString = "Data Source=weather.db";

// Initialize the database
InitializeDatabase();

app.MapGet("/weatherforecast", () =>
{
    var forecasts = GetWeatherForecasts();

    if (forecasts.Count == 0)
    {
        var newForecasts = Enumerable.Range(1, 5).Select(index =>
            new WeatherForecast
            {
                Date = DateTime.Now.AddDays(index).ToString("yyyy-MM-dd"),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = summaries[Random.Shared.Next(summaries.Length)]
            }).ToArray();

        foreach (var forecast in newForecasts)
        {
            InsertWeatherForecast(forecast);
        }

        forecasts = GetWeatherForecasts();
    }

    return Results.Ok(forecasts);
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

// Method to initialize the SQLite database
void InitializeDatabase()
{
    using var connection = new SQLiteConnection(connectionString);
    connection.Open();

    string tableCreationQuery = @"
        CREATE TABLE IF NOT EXISTS WeatherForecasts (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Date TEXT NOT NULL,
            TemperatureC INTEGER NOT NULL,
            Summary TEXT
        )";

    using var command = new SQLiteCommand(tableCreationQuery, connection);
    command.ExecuteNonQuery();
}

// Method to insert a weather forecast into the database
void InsertWeatherForecast(WeatherForecast forecast)
{
    using var connection = new SQLiteConnection(connectionString);
    connection.Open();

    string insertQuery = $@"
        INSERT INTO WeatherForecasts (Date, TemperatureC, Summary)
        VALUES ('{forecast.Date}', {forecast.TemperatureC}, '{forecast.Summary}')";

    using var command = new SQLiteCommand(insertQuery, connection);
    command.ExecuteNonQuery();
}

// Method to retrieve weather forecasts from the database
List<WeatherForecast> GetWeatherForecasts()
{
    using var connection = new SQLiteConnection(connectionString);
    connection.Open();

    string selectQuery = "SELECT Id, Date, TemperatureC, Summary FROM WeatherForecasts";

    using var command = new SQLiteCommand(selectQuery, connection);
    using var reader = command.ExecuteReader();

    var forecasts = new List<WeatherForecast>();

    while (reader.Read())
    {
        forecasts.Add(new WeatherForecast
        {
            Id = reader.GetInt32(0),
            Date = reader.GetString(1),
            TemperatureC = reader.GetInt32(2),
            Summary = reader.IsDBNull(3) ? null : reader.GetString(3)
        });
    }

    return forecasts;
}

// Model class
public class WeatherForecast
{
    public WeatherForecast()
    {
        Date = DateTime.Now.ToString("yyyy-MM-dd");
    }

    public int Id { get; set; }
    public string Date { get; set; }
    public int TemperatureC { get; set; }
    public string? Summary { get; set; }
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}