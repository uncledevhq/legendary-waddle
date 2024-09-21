import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Update this line

import { Redis } from 'ioredis';

import axios from 'axios';
import { ConfigService } from '@nestjs/config';

// import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WeatherService {
  private readonly baseUrl = 'https://api.weatherbit.io/v2.0';

  constructor(
    @Inject('REDIS') private readonly redis: Redis,
    private readonly httpService: HttpService, // Add this line
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}
  async getCurrentWeather(city: string, country: string): Promise<any> {
    // Construct a cache key based on city and country
    const cacheKey = `weather_${city}_${country}`;

    // Check if data exists in Redis cache
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData); // Return cached data
    }

    // If not cached, fetch from Weatherbit API
    const apiKey = this.configService.get<string>('WEATHERBIT_API_KEY');

    const url = `${this.baseUrl}/current?city=${city}&country=${country}&key=${apiKey}`;

    console.log(url, 'thir is the url');
    try {
      const response = await axios.get(url);
      const weatherData = response.data;

      console.log(response, 'this is the fucking response');

      // Cache the fetched data for 10 minutes (600 seconds)
      await this.redis.set(cacheKey, JSON.stringify(weatherData), 'EX', 600);

      return weatherData;
    } catch (error) {
      throw new HttpException(
        'Unable to fetch weather data',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async get16DayForecast(city: string, country: string): Promise<any> {
    const cacheKey = `forecast_${city}_${country}`;
    const cachedData = await this.redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const url = `${this.baseUrl}/forecast/daily?city=${city}&country=${country}&key=${process.env.WEATHERBIT_API_KEY}`;
    try {
      const response = await this.httpService.get(url).toPromise();
      const forecastData = response.data;

      await this.redis.set(cacheKey, JSON.stringify(forecastData), 'EX', 600); // Cache for 10 minutes
      return forecastData;
    } catch (error) {
      throw new HttpException(
        'Unable to fetch forecast data',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
