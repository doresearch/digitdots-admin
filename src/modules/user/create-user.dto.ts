export class CreateUserDto {
  uid: number;

  role: 1 | 2 | 3;

  account: string;

  password: string;

  fname: string;

  lname: string;

  address: string;

  invite_code: string;

  invited_by_code: string;

  status: 0 | 1;

  create_time: string;

  update_time: string;
}
