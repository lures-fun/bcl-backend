export class PostRegisterResponseDto {
  earnedToken: number;
  constructor(param: Partial<PostRegisterResponseDto> = {}) {
    Object.assign(this, param);
  }
}
