import { BadRequestException } from '@nestjs/common';

const TIMEZONE_OFFSET_JST = -540;

export class DateUtils {
  static now(): Date {
    if (new Date().getTimezoneOffset() !== TIMEZONE_OFFSET_JST) {
      return new Date(
        Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000,
      );
    }

    return new Date();
  }

  static buildDate(
    year: number,
    month: number,
    day: number,
    disallowFuture?: boolean,
  ): Date {
    const date = new Date();
    date.setFullYear(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new BadRequestException(`${year}/${month}/${day} is invalid date.`);
    }

    if (disallowFuture && date > new Date()) {
      throw new BadRequestException('Future date cannot be entered.');
    }

    return date;
  }

  static buildDateTime(
    year: number,
    month: number,
    day: number,
    hours: number,
    minutes: number,
    seconds: number,
    disallowFuture?: boolean,
  ): Date {
    const date = this.buildDate(year, month, day);
    date.setHours(hours, minutes, seconds, 0);

    if (
      date.getHours() !== hours ||
      date.getMinutes() !== minutes ||
      date.getSeconds() !== seconds
    ) {
      throw new BadRequestException(
        `${hours}:${minutes}:${seconds} is invalid date.`,
      );
    }

    if (disallowFuture && date > new Date()) {
      throw new BadRequestException('Future date cannot be entered.');
    }

    return date;
  }

  static formatDate(dt: Date) {
    const y = dt.getFullYear();
    const m = ('00' + (dt.getMonth() + 1)).slice(-2);
    const d = ('00' + dt.getDate()).slice(-2);
    const h = ('00' + dt.getHours()).slice(-2);
    const mi = ('00' + dt.getMinutes()).slice(-2);
    return `${y}年${m}月${d}日${h}時${mi}分`;
  }
}
