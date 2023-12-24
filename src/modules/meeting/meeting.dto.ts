import { Meeting } from './meeting.entity';

export class OrderDetailDto extends Meeting {
  lname: string;
  fname: string;
  school: string;
  address: string;
  major: string;
}
