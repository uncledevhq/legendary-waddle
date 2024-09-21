import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  async getCurrentWeather(
    @Query('city') city: string,
    @Query('country') country: string,
  ) {
    return this.weatherService.getCurrentWeather(city, country);
  }

  @Get('forecast')
  get16DayForecast(
    @Query('city') city: string,
    @Query('country') country: string,
  ) {
    return this.weatherService.get16DayForecast(city, country);
  }
}
